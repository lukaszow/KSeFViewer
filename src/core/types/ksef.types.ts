/**
 * Raw KSeF FA(3) XML structure (output of `fast-xml-parser`).
 *
 * All leaf values are strings because the parser runs with `parseTagValue: false`.
 * Automatic numeric coercion would corrupt identifiers (e.g. NIP `0123456789`
 * becomes `123456789`, bank account numbers become scientific notation).
 * Numeric values are converted explicitly in `invoiceMapper.ts`.
 *
 * Every element is optional: the FA(3) schema allows many variants, and a document
 * is only usable if the sections required by the viewer are present (see `ksefParser.ts`).
 * See `DOCS_KSEF_SCHEMA.md` for the authoritative field reference.
 */

export interface KSeFFormCode {
    '#text'?: string;
    kodSystemowy?: string;
    wersjaSchemy?: string;
}

export interface KSeFHeader {
    KodFormularza?: KSeFFormCode | string;
    WariantFormularza?: string;
    DataWytworzeniaFa?: string;
    SystemInfo?: string;
}

export interface KSeFPolishAddress {
    KodKraju?: string;
    Ulica?: string;
    NrDomu?: string;
    NrLokalu?: string;
    Miejscowosc?: string;
    KodPocztowy?: string;
}

export interface KSeFAddress {
    KodKraju?: string;
    AdresL1?: string;
    AdresL2?: string;
    /** FA(2) fallback kept for backward compatibility. */
    AdresPol?: KSeFPolishAddress;
}

export interface KSeFIdentity {
    NIP?: string;
    Nazwa?: string;
    KodUE?: string;
    NrVatUE?: string;
    KodKraju?: string;
    NrID?: string;
    BrakID?: string;
}

export interface KSeFSubject {
    DaneIdentyfikacyjne?: KSeFIdentity;
    Adres?: KSeFAddress;
    DaneKontaktowe?: {
        Email?: string;
        Telefon?: string;
    };
}

export interface KSeFLineItem {
    NrWierszaFa?: string;
    UU_ID?: string;
    P_6A?: string;
    P_7?: string;
    P_8A?: string;
    P_8B?: string;
    P_9A?: string;
    P_9B?: string;
    P_11?: string;
    P_11A?: string;
    P_12?: string;
}

export interface KSeFAnnotations {
    P_16?: string;
    P_17?: string;
    P_18?: string;
    P_18A?: string;
}

export interface KSeFSettlement {
    DoZaplaty?: string;
}

export interface KSeFPeriod {
    P_6_Od?: string;
    P_6_Do?: string;
}

export interface KSeFInvoiceBody {
    KodWaluty?: string;
    /** Issue date (YYYY-MM-DD). */
    P_1?: string;
    P_1M?: string;
    /** Invoice number. */
    P_2?: string;
    P_6?: string;
    P_15?: string;
    RodzajFaktury?: string;
    Adnotacje?: KSeFAnnotations;
    OkresFa?: KSeFPeriod;
    Rozliczenie?: KSeFSettlement;
    FaWiersz?: KSeFLineItem | KSeFLineItem[];
    /** Dynamic fields: `P_13_*`, `P_14_*` and `P_14_*W` (VAT in PLN for foreign-currency invoices). */
    [key: string]: unknown;
}

export interface KSeFInvoice {
    Naglowek?: KSeFHeader;
    Podmiot1?: KSeFSubject; // Seller
    Podmiot2?: KSeFSubject; // Buyer
    Fa?: KSeFInvoiceBody;
}

/**
 * Root structure after parsing with fast-xml-parser.
 */
export interface KSeFRoot {
    Faktura?: KSeFInvoice;
}
