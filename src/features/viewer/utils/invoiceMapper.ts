import type {
    KSeFAddress,
    KSeFAnnotations,
    KSeFIdentity,
    KSeFInvoice,
    KSeFInvoiceBody,
    KSeFLineItem,
    KSeFSubject,
} from '../../../core/types/ksef.types';
import type {
    Invoice,
    InvoiceLine,
    InvoiceParty,
    VatRateSummary,
} from '../../../core/types/invoice.types';

const XML_ENTITIES: Record<string, string> = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    apos: "'",
};

/**
 * `processEntities` is disabled in the parser for security, so predefined entities
 * survive as literal text. Decode only the five XML predefined entities and numeric
 * character references — never DTD-declared entities.
 */
export const decodeXmlEntities = (value: string): string =>
    value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, code: string) => {
        if (code.startsWith('#')) {
            const isHex = code[1]?.toLowerCase() === 'x';
            const codePoint = Number.parseInt(code.slice(isHex ? 2 : 1), isHex ? 16 : 10);
            if (!Number.isFinite(codePoint) || codePoint < 0 || codePoint > 0x10ffff) {
                return match;
            }
            try {
                return String.fromCodePoint(codePoint);
            } catch {
                return match;
            }
        }
        return XML_ENTITIES[code.toLowerCase()] ?? match;
    });

const text = (value: unknown): string | undefined => {
    if (typeof value !== 'string') return undefined;
    const trimmed = value.trim();
    return trimmed ? decodeXmlEntities(trimmed) : undefined;
};

const toNumber = (value: unknown): number | undefined => {
    const raw = text(value);
    if (!raw) return undefined;

    const normalized = raw.replace(/[\s\u00a0]/g, '').replace(',', '.');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : undefined;
};

const toArray = <T>(value: T | T[] | undefined): T[] => {
    if (value === undefined) return [];
    return Array.isArray(value) ? value : [value];
};

const VAT_RATE_TEXT: Record<string, string> = {
    '23': '23%',
    '22': '22%',
    '8': '8%',
    '7': '7%',
    '5': '5%',
    '3': '3%',
    '0': '0%',
    zw: 'zw.',
    oo: 'oo.',
    np: 'np.',
    '0 wdt': '0% WDT',
    '0 ex': '0% eksport',
    '0 kr': '0% krajowa',
};

const formatVatRate = (raw?: string): string => {
    if (!raw) return '—';
    return VAT_RATE_TEXT[raw.trim().toLowerCase()] ?? raw.trim();
};

const RATE_LABELS: Record<string, string> = {
    '1': '23%',
    '2': '8%',
    '3': '5%',
    '4': '0%',
    '5': '0% WDT',
    '6_1': '0% eksport',
    '6_2': '0% eksport',
    '6_3': '0% eksport',
    '7': '0% poza terytorium kraju',
    '11': '0% nowe środki transportu',
};

const RATE_ORDER = ['1', '2', '3', '4', '5', '6_1', '6_2', '6_3', '7', '11'];

const rateRank = (suffix: string): number => {
    const index = RATE_ORDER.indexOf(suffix);
    return index === -1 ? RATE_ORDER.length : index;
};

const buildVatBreakdown = (body: KSeFInvoiceBody): VatRateSummary[] => {
    const rows: Array<VatRateSummary & { order: number }> = [];

    for (const key of Object.keys(body)) {
        const match = /^P_13_(.+)$/.exec(key);
        if (!match) continue;

        const suffix = match[1];
        const net = toNumber(body[key]);
        if (net === undefined) continue;

        const vat = toNumber(body[`P_14_${suffix}`]) ?? 0;
        if (net === 0 && vat === 0) continue;

        rows.push({
            label: RATE_LABELS[suffix] ?? `P_13_${suffix}`,
            net,
            vat,
            order: rateRank(suffix),
        });
    }

    return rows
        .sort((a, b) => a.order - b.order)
        .map(({ label, net, vat }) => ({ label, net, vat }));
};

const mapAddress = (address?: KSeFAddress): string[] => {
    if (!address) return [];

    const lines: string[] = [];
    const line1 = text(address.AdresL1);
    const line2 = text(address.AdresL2);

    if (line1) lines.push(line1);
    if (line2) lines.push(line2);

    if (lines.length > 0) {
        const country = text(address.KodKraju);
        if (country && country.toUpperCase() !== 'PL') lines.push(country);
        return lines;
    }

    // FA(2) fallback for older documents.
    const legacy = address.AdresPol;
    if (!legacy) return [];

    const street = [text(legacy.Ulica), text(legacy.NrDomu)].filter(Boolean).join(' ');
    const flat = text(legacy.NrLokalu);
    const streetWithFlat = flat ? `${street}${street ? '/' : ''}${flat}` : street;
    const city = [text(legacy.KodPocztowy), text(legacy.Miejscowosc)].filter(Boolean).join(' ');

    return [streetWithFlat, city, text(legacy.KodKraju)]
        .filter((part): part is string => Boolean(part));
};

const mapIdentifier = (identity?: KSeFIdentity): InvoiceParty['identifier'] => {
    if (!identity) return undefined;

    const nip = text(identity.NIP);
    if (nip) return { label: 'NIP', value: nip };

    const kodUe = text(identity.KodUE);
    const nrVatUe = text(identity.NrVatUE);
    if (kodUe && nrVatUe) return { label: 'VAT UE', value: `${kodUe} ${nrVatUe}` };

    const kodKraju = text(identity.KodKraju);
    const nrId = text(identity.NrID);
    if (kodKraju && nrId) return { label: `ID (${kodKraju})`, value: nrId };

    return undefined;
};

const mapParty = (subject?: KSeFSubject): InvoiceParty => {
    const identity = subject?.DaneIdentyfikacyjne;

    return {
        name: text(identity?.Nazwa) ?? '—',
        identifier: mapIdentifier(identity),
        addressLines: mapAddress(subject?.Adres),
    };
};

const ANNOTATIONS: Array<[keyof KSeFAnnotations, string]> = [
    ['P_16', 'Metoda kasowa'],
    ['P_17', 'Faktura wystawiona przez nabywcę'],
    ['P_18', 'Mechanizm podzielonej płatności (MPP)'],
    ['P_18A', 'MPP – pozostałe przypadki'],
];

const mapAnnotations = (annotations?: KSeFAnnotations): string[] =>
    ANNOTATIONS.filter(([key]) => text(annotations?.[key]) === '1')
        .map(([, label]) => label);

const INVOICE_TYPE_LABELS: Record<string, string> = {
    VAT: 'Faktura VAT',
    KOR: 'Faktura korygująca',
    ZAL: 'Faktura zaliczkowa',
    UPR: 'Faktura uproszczona',
    ROZ: 'Faktura rozliczeniowa',
    KOR_ZAL: 'Korekta faktury zaliczkowej',
    KOR_ROZ: 'Korekta faktury rozliczeniowej',
};

const mapLine = (item: KSeFLineItem, index: number): InvoiceLine => ({
    ordinal: toNumber(item.NrWierszaFa) ?? index + 1,
    name: text(item.P_7) ?? '—',
    unit: text(item.P_8A),
    quantity: toNumber(item.P_8B),
    unitPriceNet: toNumber(item.P_9A) ?? toNumber(item.P_9B),
    lineNet: toNumber(item.P_11),
    lineNetForeign: toNumber(item.P_11A),
    vatRate: formatVatRate(text(item.P_12)),
});

export const mapToInvoice = (invoice: KSeFInvoice): Invoice => {
    const body: KSeFInvoiceBody = invoice.Fa ?? {};
    const lines = toArray(body.FaWiersz).map(mapLine);
    const totalGross = toNumber(body.P_15);
    const amountDue = toNumber(body.Rozliczenie?.DoZaplaty) ?? totalGross;
    const invoiceType = text(body.RodzajFaktury);

    return {
        invoiceNumber: text(body.P_2) ?? '—',
        issueDate: text(body.P_1),
        saleDate: text(body.P_6) ?? text(body.OkresFa?.P_6_Od),
        currency: text(body.KodWaluty) ?? 'PLN',
        invoiceType,
        invoiceTypeLabel: invoiceType
            ? INVOICE_TYPE_LABELS[invoiceType] ?? invoiceType
            : undefined,
        seller: mapParty(invoice.Podmiot1),
        buyer: mapParty(invoice.Podmiot2),
        lines,
        vatBreakdown: buildVatBreakdown(body),
        totalGross,
        amountDue,
        annotations: mapAnnotations(body.Adnotacje),
    };
};
