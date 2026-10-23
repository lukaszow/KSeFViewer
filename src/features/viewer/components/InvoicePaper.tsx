import { useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import type { Invoice } from '../../../core/types/invoice.types';
import { validateInvoice } from '../utils/ksefValidators';
import InvoiceHeader from './InvoiceHeader';
import InvoiceTable from './InvoiceTable';
import InvoiceSummary from './InvoiceSummary';

interface InvoicePaperProps {
    invoice: Invoice;
}

/**
 * Main container for the invoice visualization.
 * Designed to resemble a physical A4 document.
 */
const InvoicePaper = ({ invoice }: InvoicePaperProps) => {
    const warnings = useMemo(() => validateInvoice(invoice), [invoice]);

    return (
        <article
            aria-label={`Faktura ${invoice.invoiceNumber}`}
            className="max-w-[210mm] mx-auto my-8 bg-white shadow-2xl border border-slate-200 p-[20mm] min-h-[297mm] flex flex-col gap-8 print:shadow-none print:border-none print:m-0"
        >
            <InvoiceHeader
                seller={invoice.seller}
                buyer={invoice.buyer}
                invoiceNumber={invoice.invoiceNumber}
                issueDate={invoice.issueDate}
                saleDate={invoice.saleDate}
                invoiceTypeLabel={invoice.invoiceTypeLabel}
            />

            {warnings.length > 0 && (
                <section
                    role="status"
                    className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900 print:hidden"
                >
                    <h2 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                        <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                        Uwagi do faktury
                    </h2>
                    <ul className="list-inside list-disc space-y-1 text-sm">
                        {warnings.map((warning) => (
                            <li key={warning.code}>{warning.message}</li>
                        ))}
                    </ul>
                </section>
            )}

            <div className="flex-grow">
                <InvoiceTable items={invoice.lines} />
            </div>

            <InvoiceSummary
                vatBreakdown={invoice.vatBreakdown}
                totalGross={invoice.totalGross}
                amountDue={invoice.amountDue}
                currency={invoice.currency}
            />

            {/* Footer / Annotations */}
            {invoice.annotations.length > 0 && (
                <div className="mt-8 pt-4 border-t border-slate-100 text-xs text-slate-500 flex flex-wrap gap-4">
                    {invoice.annotations.map((annotation) => (
                        <span
                            key={annotation}
                            className="px-2 py-1 bg-slate-50 rounded border border-slate-100 font-medium"
                        >
                            {annotation}
                        </span>
                    ))}
                </div>
            )}
        </article>
    );
};

export default InvoicePaper;
