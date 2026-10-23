import { describe, expect, it } from 'vitest';
import { MAX_XML_SIZE, parseKsefXml } from './ksefParser';

const minimalInvoice = (faContent = '') => `<?xml version="1.0" encoding="UTF-8"?>
<Faktura>
    <Naglowek>
        <DataWytworzeniaFa>2026-01-01T00:00:00Z</DataWytworzeniaFa>
    </Naglowek>
    <Podmiot1>
        <DaneIdentyfikacyjne><NIP>0123456789</NIP><Nazwa>Seller</Nazwa></DaneIdentyfikacyjne>
    </Podmiot1>
    <Podmiot2>
        <DaneIdentyfikacyjne><NIP>9876543210</NIP><Nazwa>Buyer</Nazwa></DaneIdentyfikacyjne>
    </Podmiot2>
    <Fa>
        <KodWaluty>PLN</KodWaluty>
        <P_1>2026-01-01</P_1>
        <P_2>FV/1</P_2>
        <P_15>123.45</P_15>
        ${faContent}
    </Fa>
</Faktura>`;

describe('parseKsefXml', () => {
    it('parses a minimal FA(3) invoice', () => {
        const result = parseKsefXml(minimalInvoice());

        expect(result.ok).toBe(true);
        if (!result.ok) return;

        expect(result.raw.Fa?.P_15).toBe('123.45');
        expect(result.raw.Fa?.P_2).toBe('FV/1');
    });

    it('keeps identifiers as strings (leading zeros are not lost)', () => {
        const result = parseKsefXml(minimalInvoice());

        expect(result.ok).toBe(true);
        if (!result.ok) return;

        expect(result.raw.Podmiot1?.DaneIdentyfikacyjne?.NIP).toBe('0123456789');
    });

    it('strips namespace prefixes from tag names', () => {
        const xml = minimalInvoice().replace(/<(\/?)(Faktura|Fa|Podmiot1|Podmiot2)/g, '<$1ns:$2')
            .replace('<ns:Faktura>', '<ns:Faktura xmlns:ns="http://crd.gov.pl/wzor/2025/06/25/13775/">');

        const result = parseKsefXml(xml);

        expect(result.ok).toBe(true);
    });

    it('keeps XML entities undecoded when entity processing is disabled', () => {
        const result = parseKsefXml(minimalInvoice('<P_7>A &amp; B</P_7>'));

        expect(result.ok).toBe(true);
        if (!result.ok) return;

        expect(result.raw.Fa?.P_7).toBe('A &amp; B');
    });

    it('rejects documents without the <Faktura> root', () => {
        const result = parseKsefXml('<Other><Fa/></Other>');

        expect(result).toEqual({ ok: false, error: 'not_ksef' });
    });

    it('rejects FA(3) documents without the required sections', () => {
        const result = parseKsefXml('<Faktura><Fa><P_2>FV/1</P_2></Fa></Faktura>');

        expect(result).toEqual({ ok: false, error: 'missing_sections' });
    });

    it('rejects malformed XML instead of throwing', () => {
        const result = parseKsefXml('<Faktura><Fa></Faktura>');

        expect(result.ok).toBe(false);
    });

    it('rejects files above the size limit', () => {
        const result = parseKsefXml('x'.repeat(MAX_XML_SIZE + 1));

        expect(result).toEqual({ ok: false, error: 'too_large' });
    });
});
