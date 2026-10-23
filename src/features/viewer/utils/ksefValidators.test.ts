import { describe, expect, it } from 'vitest';
import type { Invoice } from '../../../core/types/invoice.types';
import { validateInvoice } from './ksefValidators';

const buildInvoice = (overrides: Partial<Invoice> = {}): Invoice => ({
    invoiceNumber: 'FV/1',
    issueDate: '2026-02-15',
    saleDate: '2026-02-14',
    currency: 'PLN',
    invoiceType: 'VAT',
    seller: { name: 'Seller', addressLines: [] },
    buyer: { name: 'Buyer', addressLines: [] },
    lines: [
        {
            ordinal: 1,
            name: 'Item',
            lineNet: 100,
            vatRate: '23%',
        },
    ],
    vatBreakdown: [{ label: '23%', net: 100, vat: 23 }],
    totalGross: 123,
    amountDue: 123,
    annotations: [],
    ...overrides,
});

const codes = (invoice: Invoice) => validateInvoice(invoice).map((warning) => warning.code);

describe('validateInvoice', () => {
    it('returns no warnings for a consistent invoice', () => {
        expect(validateInvoice(buildInvoice())).toEqual([]);
    });

    it('tolerates one-cent rounding differences', () => {
        expect(codes(buildInvoice({ totalGross: 123.01 }))).toEqual([]);
    });

    it('reports a net mismatch between lines and VAT breakdown', () => {
        const invoice = buildInvoice({
            lines: [{ ordinal: 1, name: 'Item', lineNet: 200, vatRate: '23%' }],
            vatBreakdown: [{ label: '23%', net: 100, vat: 23 }],
            totalGross: 123,
        });

        expect(codes(invoice)).toEqual(['net_mismatch']);
    });

    it('does not report net mismatches for corrections and settlements', () => {
        for (const invoiceType of ['KOR', 'KOR_ZAL', 'KOR_ROZ', 'ZAL', 'ROZ']) {
            const invoice = buildInvoice({
                invoiceType,
                lines: [{ ordinal: 1, name: 'Item', lineNet: 200, vatRate: '23%' }],
                vatBreakdown: [{ label: '23%', net: 100, vat: 23 }],
            });

            expect(codes(invoice), invoiceType).toEqual([]);
        }
    });

    it('does not compare foreign-currency line totals with PLN summary fields', () => {
        const invoice = buildInvoice({
            lines: [
                {
                    ordinal: 1,
                    name: 'Item',
                    lineNetForeign: 3000,
                    vatRate: '23%',
                },
            ],
        });

        expect(codes(invoice)).toEqual([]);
    });

    it('reports a gross mismatch', () => {
        expect(codes(buildInvoice({ totalGross: 200 }))).toEqual(['gross_mismatch']);
    });

    it('skips the gross check when the invoice has no VAT breakdown', () => {
        expect(codes(buildInvoice({ vatBreakdown: [], totalGross: 450 }))).toEqual([]);
    });

    it('reports an issue date earlier than the sale date', () => {
        expect(
            codes(buildInvoice({ issueDate: '2026-02-10', saleDate: '2026-02-15' })),
        ).toEqual(['date_order']);
    });

    it('does not report date order for settlement invoices', () => {
        expect(
            codes(
                buildInvoice({
                    invoiceType: 'ROZ',
                    issueDate: '2026-08-17',
                    saleDate: '2026-09-17',
                }),
            ),
        ).toEqual([]);
    });

    it('reports malformed dates', () => {
        expect(codes(buildInvoice({ issueDate: '15.02.2026' }))).toEqual(['invalid_date']);
    });
});
