/**
 * KSeF FA(2) Logical Structure
 * Based on DOCS_KSEF_SCHEMA.md
 */

export interface KSeFHeader {
    KodWaluty: string; // e.g., PLN
    DataWytworzeniaFa: string; // Generation Date (ISO string)
}

export interface KSeFAddress {
    AdresPol?: {
        KodKraju: string;
        Ulica?: string;
        NrDomu?: string;
        NrLokalu?: string;
        Miejscowosc: string;
        KodPocztowy: string;
    };
    // Add other address types (AdresZagr) if needed based on full schema
}

export interface KSeFSubject {
    DaneIdentyfikacyjne: {
        NIP: string;
        Nazwa: string;
    };
    Adres: KSeFAddress;
}

export interface KSeFLineItem {
    NrWierszaFa: number; // Ordinal Number
    P_7: string;        // Item Name (Nazwa towaru/usługi)
    P_9A: number;       // Unit Price Net (Cena jedn. netto)
    P_11: number;       // Total Net Value (Wartość netto wiersza)
    P_12: string;       // VAT Rate (Stawka VAT, np. "23", "zw")
}

export interface KSeFInvoiceBody {
    P_1: string;        // Invoice Number
    P_2: string;        // Issue Date (YYYY-MM-DD)
    P_6: string;        // Sale Date (YYYY-MM-DD)
    P_13_1: number;     // Net Amount (Sum) for 23% VAT
    P_14_1: number;     // VAT Amount (Sum) for 23% VAT
    P_15: number;       // Total Gross Amount (Do Zapłaty)
    Adnotacje: {
        P_16: number;     // "Cash Accounting" method (Metoda Kasowa) - 1/0
        P_18: number;     // Split Payment Mechanism (MPP) - 1/0
    };
    FaWiersz: KSeFLineItem | KSeFLineItem[];
}

export interface KSeFInvoice {
    Naglowek: KSeFHeader;
    Podmiot1: KSeFSubject; // Seller
    Podmiot2: KSeFSubject; // Buyer
    Fa: KSeFInvoiceBody;
}

/**
 * Root structure after parsing with fast-xml-parser
 */
export interface KSeFRoot {
    Faktura: KSeFInvoice;
}
