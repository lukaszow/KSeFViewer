/**
 * View model consumed by the UI.
 * Produced from the raw FA(3) structure by `invoiceMapper.ts`, so components never
 * need to know KSeF field names such as `P_13_1` or `AdresL1`.
 */

export interface InvoiceIdentifier {
    label: string;
    value: string;
}

export interface InvoiceParty {
    name: string;
    identifier?: InvoiceIdentifier;
    addressLines: string[];
}

export interface InvoiceLine {
    ordinal: number;
    name: string;
    unit?: string;
    quantity?: number;
    /** Unit net price in the invoice currency (`P_9A`, falling back to `P_9B`). */
    unitPriceNet?: number;
    /** Line net total in PLN (`P_11`). */
    lineNet?: number;
    /** Line net total in a foreign currency (`P_11A`), used for display only. */
    lineNetForeign?: number;
    vatRate: string;
}

export interface VatRateSummary {
    label: string;
    net: number;
    vat: number;
}

export interface Invoice {
    invoiceNumber: string;
    issueDate?: string;
    saleDate?: string;
    currency: string;
    invoiceType?: string;
    invoiceTypeLabel?: string;
    seller: InvoiceParty;
    buyer: InvoiceParty;
    lines: InvoiceLine[];
    vatBreakdown: VatRateSummary[];
    totalGross?: number;
    amountDue?: number;
    annotations: string[];
}
