import { XMLParser } from 'fast-xml-parser';
import { KSeFRoot, KSeFInvoice } from '../../../core/types/ksef.types';
import { MAX_FILE_SIZE } from '../../../core/utils/fileValidation';

// Same limit as the upload guard in `fileValidation.ts`.
export const MAX_XML_SIZE = MAX_FILE_SIZE;

export type ParseErrorCode = 'too_large' | 'invalid_xml' | 'not_ksef' | 'missing_sections';

export type RawParseResult =
    | { ok: true; raw: KSeFInvoice }
    | { ok: false; error: ParseErrorCode };

const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '', // No prefix for easier access
    // Keep all values as strings: automatic coercion corrupts identifiers
    // (leading zeros in NIP, bank account numbers, numeric invoice numbers).
    parseTagValue: false,
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

const isObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null;

/**
 * Parses raw XML into the FA(3) structure and validates the sections required by the viewer.
 * Never throws — failures are reported as a typed error code so the UI can show a precise message.
 */
export const parseKsefXml = (xmlString: string): RawParseResult => {
    if (new TextEncoder().encode(xmlString).byteLength > MAX_XML_SIZE) {
        return { ok: false, error: 'too_large' };
    }

    let parsed: KSeFRoot;
    try {
        parsed = parser.parse(xmlString) as KSeFRoot;
    } catch {
        return { ok: false, error: 'invalid_xml' };
    }

    const invoice = parsed?.Faktura;
    if (!isObject(invoice)) {
        return { ok: false, error: 'not_ksef' };
    }
    if (!isObject(invoice.Fa) || !isObject(invoice.Podmiot1) || !isObject(invoice.Podmiot2)) {
        return { ok: false, error: 'missing_sections' };
    }

    return { ok: true, raw: invoice };
};
