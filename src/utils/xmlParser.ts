
import { XMLParser } from 'fast-xml-parser';

export interface InvoiceData {
    header: {
        number: string;
        date: string;
        place?: string;
    };
    seller: {
        name: string;
        nip: string;
        address: string;
    };
    buyer: {
        name: string;
        nip: string;
        address: string;
    };
    items: Array<{
        name: string;
        quantity: number;
        unit: string;
        netPrice: number;
        netValue: number;
        vatRate: string;
    }>;
    summary: {
        net: number;
        vat: number;
        gross: number;
    };
}

const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    parseTagValue: false, // Ensure NIP and other numeric strings stay as strings
    // Strip namespaces (e.g. ns:Faktura -> Faktura)
    transformTagName: (tagName) => {
        const i = tagName.indexOf(':');
        return i > -1 ? tagName.substring(i + 1) : tagName;
    }
});


export const parseKsefXml = (xmlContent: string): InvoiceData | null => {
    try {
        const result = parser.parse(xmlContent);

        // Handle different root structures if necessary, but FA(2) usually starts with Faktura
        const root = result.Faktura;

        if (!root) {
            console.error("Invalid KSeF XML: Missing Root Element");
            return null;
        }

        const header = root.Naglowek || {};
        const fa = root.Fa || {};
        const seller = root.Podmiot1 || {};
        const buyer = root.Podmiot2 || {};

        // Robust extraction for items
        // FA(2) often uses FakturaWiersz, FA(3) uses FaWiersz inside Fa element
        let details = root.FakturaWiersz || root.FaWiersz;

        // Check nested in Fa (common in FA(3))
        if (!details && root.Fa) {
            details = root.Fa.FakturaWiersz || root.Fa.FaWiersz;
        }

        const summary = root.Fa || {}; // Aggregated totals often here

        // Normalize items to array
        let itemsList = [];
        if (details) {
            itemsList = Array.isArray(details) ? details : [details];
        }

        // Helper to extract nested P_ fields safely
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const getVal = (obj: any, key: string, def: any = "") => obj?.[key] || def;

        // In FA(3) P_1, P_2, P_1M are often in <Fa>, in FA(2) in <Naglowek>
        const getHeaderVal = (key: string) => getVal(fa, key) || getVal(header, key);

        // Address Extraction Helper
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const extractAddress = (podmiot: any) => {
            const addr = podmiot.Adres || {};
            // Try structured address (AdresPol/AdresZagr)
            const structured = addr.AdresPol || addr.AdresZagr;
            if (structured) {
                return [
                    getVal(structured, 'Ulica'),
                    getVal(structured, 'NrDomu'),
                    getVal(structured, 'NrLokalu') ? "/" + getVal(structured, 'NrLokalu') : "",
                    ",",
                    getVal(structured, 'KodPocztowy'),
                    getVal(structured, 'Miejscowosc')
                ].filter(Boolean).join(" ");
            }
            // Try unstructured address (AdresL1, AdresL2...)
            const lines = [
                getVal(addr, 'AdresL1'),
                getVal(addr, 'AdresL2'),
                getVal(addr, 'AdresL3'),
                getVal(addr, 'AdresL4'),
                getVal(addr, 'AdresL5'),
                getVal(addr, 'AdresL6')
            ].filter(Boolean);

            if (lines.length > 0) return lines.join(", ");

            return "";
        };

        // Seller/Buyer Data Extraction
        const sIdent = seller.DaneIdentyfikacyjne || {};
        const bIdent = buyer.DaneIdentyfikacyjne || {};

        return {
            header: {
                number: getHeaderVal('P_2') || "BRAK",
                date: getHeaderVal('P_1'),
                place: getHeaderVal('P_1M'),
            },
            seller: {
                name: getVal(sIdent, 'Nazwa') || (getVal(sIdent, 'ImiePierwsze') + " " + getVal(sIdent, 'Nazwisko')),
                nip: getVal(sIdent, 'NIP'),
                address: extractAddress(seller),
            },
            buyer: {
                name: getVal(bIdent, 'Nazwa') || (getVal(bIdent, 'ImiePierwsze') + " " + getVal(bIdent, 'Nazwisko')),
                nip: getVal(bIdent, 'NIP'),
                address: extractAddress(buyer),
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            items: itemsList.map((item: any) => ({
                name: getVal(item, 'P_7'),
                quantity: Number(getVal(item, 'P_8B')),
                unit: getVal(item, 'P_8A'),
                netPrice: Number(getVal(item, 'P_9A')),
                netValue: Number(getVal(item, 'P_11')),
                vatRate: String(getVal(item, 'P_12')),
            })).filter((i: { name?: string }) => i.name), // Filter out empty or structural rows if any
            summary: {
                net: Number(getVal(summary, 'P_13_1', 0)) + Number(getVal(summary, 'P_13_2', 0)) + Number(getVal(summary, 'P_13_3', 0)), // Simplification: Summing net bases
                vat: Number(getVal(summary, 'P_14_1', 0)) + Number(getVal(summary, 'P_14_2', 0)) + Number(getVal(summary, 'P_14_3', 0)),
                gross: Number(getVal(summary, 'P_15', 0)),
            }
        };


    } catch (e) {
        console.error("Parsing Error", e);
        return null;
    }
};

export const DEMO_INVOICE: InvoiceData = {
    header: {
        number: "FV/2024/01/001",
        date: "2024-01-10",
        place: "Warszawa"
    },
    seller: {
        name: "Software House Sp. z o.o.",
        nip: "1234567890",
        address: "ul. Programistów 1/2, 00-001 Warszawa"
    },
    buyer: {
        name: "Jan Kowalski Services",
        nip: "9876543210",
        address: "ul. Klientów 5, 02-300 Wrocław"
    },
    items: [
        { name: "Usługi programistyczne", quantity: 1, unit: "szt", netPrice: 5000.00, netValue: 5000.00, vatRate: "23" },
        { name: "Konsultacje IT", quantity: 5, unit: "h", netPrice: 200.00, netValue: 1000.00, vatRate: "23" }
    ],
    summary: {
        net: 6000.00,
        vat: 1380.00,
        gross: 7380.00
    }
};
