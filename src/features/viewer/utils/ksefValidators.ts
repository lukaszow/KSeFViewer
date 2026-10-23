import type { Invoice } from '../../../core/types/invoice.types';

export type WarningCode = 'net_mismatch' | 'gross_mismatch' | 'date_order' | 'invalid_date';

export interface InvoiceWarning {
    code: WarningCode;
    message: string;
}

const TOLERANCE = 0.02;

const sum = (values: number[]): number => values.reduce((total, value) => total + value, 0);

const isValidDate = (value: string): boolean =>
    /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));

const formatNumber = (value: number): string =>
    new Intl.NumberFormat('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

/**
 * Sanity checks for the mapped invoice. They must not produce false positives on
 * corrections (`KOR*`), advance/settlement invoices (`ZAL`, `ROZ`) or foreign-currency
 * documents — the line totals and summary fields do not always align there.
 */
export const validateInvoice = (invoice: Invoice): InvoiceWarning[] => {
    const warnings: InvoiceWarning[] = [];

    const netTotal = sum(invoice.vatBreakdown.map((row) => row.net));
    const vatTotal = sum(invoice.vatBreakdown.map((row) => row.vat));

    const lineNets = invoice.lines
        .map((line) => line.lineNet)
        .filter((value): value is number => value !== undefined);
    const allLinesCovered = invoice.lines.every(
        (line) => line.lineNet !== undefined || line.lineNetForeign !== undefined,
    );

    if (
        invoice.invoiceType === 'VAT' &&
        allLinesCovered &&
        lineNets.length > 0 &&
        invoice.vatBreakdown.length > 0
    ) {
        const lineTotal = sum(lineNets);
        if (Math.abs(lineTotal - netTotal) > TOLERANCE) {
            warnings.push({
                code: 'net_mismatch',
                message: `Suma wartości netto pozycji (${formatNumber(lineTotal)}) nie zgadza się z sumą stawek VAT (${formatNumber(netTotal)}).`,
            });
        }
    }

    if (invoice.totalGross !== undefined && invoice.vatBreakdown.length > 0) {
        if (Math.abs(netTotal + vatTotal - invoice.totalGross) > TOLERANCE) {
            warnings.push({
                code: 'gross_mismatch',
                message: `Suma netto i VAT (${formatNumber(netTotal + vatTotal)}) nie zgadza się z kwotą brutto (${formatNumber(invoice.totalGross)}).`,
            });
        }
    }

    const { issueDate, saleDate } = invoice;
    if (issueDate && !isValidDate(issueDate)) {
        warnings.push({
            code: 'invalid_date',
            message: `Nieprawidłowy format daty wystawienia: ${issueDate}.`,
        });
    }
    if (saleDate && !isValidDate(saleDate)) {
        warnings.push({
            code: 'invalid_date',
            message: `Nieprawidłowy format daty sprzedaży: ${saleDate}.`,
        });
    }
    if (
        invoice.invoiceType === 'VAT' &&
        issueDate &&
        saleDate &&
        isValidDate(issueDate) &&
        isValidDate(saleDate) &&
        Date.parse(issueDate) < Date.parse(saleDate)
    ) {
        warnings.push({
            code: 'date_order',
            message: 'Data wystawienia jest wcześniejsza niż data sprzedaży.',
        });
    }

    return warnings;
};
