import { XMLParser } from 'fast-xml-parser';
import { KSeFRoot, KSeFInvoice } from '../../../core/types/ksef.types';

// 10 MB limit — generous for any real KSeF invoice
const MAX_XML_SIZE = 10 * 1024 * 1024;

const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '', // No prefix for easier access
    parseTagValue: true,
    trimValues: true,
    // Disable entity processing to prevent XXE and XML-bomb attacks
    processEntities: false,
    // KSeF XML usually has namespaces like <ns:Faktura>
    // We want to normalize them to just the tag names
    transformTagName: (tagName) => {
        const colonIndex = tagName.indexOf(':');
        return colonIndex !== -1 ? tagName.substring(colonIndex + 1) : tagName;
    },
});

/**
 * Parses raw XML string into a KSeFInvoice object.
 * Validates basic structure based on DOCS_KSEF_SCHEMA.md.
 */
export const parseKsefXml = (xmlString: string): KSeFInvoice | null => {
    if (xmlString.length > MAX_XML_SIZE) {
        console.error('XML file exceeds maximum allowed size.');
        return null;
    }
    try {
        const jsonObj: KSeFRoot = parser.parse(xmlString);

        if (!jsonObj || !jsonObj.Faktura) {
            console.error('Invalid KSeF XML: Root <Faktura> element not found.');
            return null;
        }

        const invoice = jsonObj.Faktura;

        // Basic validation of required sections
        if (!invoice.Naglowek || !invoice.Podmiot1 || !invoice.Podmiot2 || !invoice.Fa) {
            console.error('Invalid KSeF XML: Missing core sections (Naglowek, Podmiot1, Podmiot2, or Fa).');
            return null;
        }

        // Ensure FaWiersz is always an array for easier mapping
        if (invoice.Fa.FaWiersz && !Array.isArray(invoice.Fa.FaWiersz)) {
            invoice.Fa.FaWiersz = [invoice.Fa.FaWiersz];
        }

        return invoice;
    } catch (error) {
        console.error('Error parsing KSeF XML:', error);
        return null;
    }
};
