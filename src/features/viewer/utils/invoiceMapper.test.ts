import { describe, expect, it } from 'vitest';
import { parseInvoiceSync } from './parseInvoice';
import { decodeXmlEntities } from './invoiceMapper';

const wrap = (faInner: string, subjects = '') => `<?xml version="1.0" encoding="UTF-8"?>
<Faktura>
    <Podmiot1>
        <DaneIdentyfikacyjne><NIP>0123456789</NIP><Nazwa>Soft &amp; House</Nazwa></DaneIdentyfikacyjne>
        <Adres>
            <KodKraju>PL</KodKraju>
            <AdresL1>ul. Programistów 1 m. 2</AdresL1>
            <AdresL2>00-001 Warszawa</AdresL2>
        </Adres>
    </Podmiot1>
    <Podmiot2>
        <DaneIdentyfikacyjne><NIP>9876543210</NIP><Nazwa>Buyer</Nazwa></DaneIdentyfikacyjne>
        <Adres>
            <KodKraju>DE</KodKraju>
            <AdresL1>Hauptstrasse 7</AdresL1>
            <AdresL2>10115 Berlin</AdresL2>
        </Adres>
    </Podmiot2>
    ${subjects}
    <Fa>${faInner}</Fa>
</Faktura>`;

const parse = (faInner: string, subjects = '') => {
    const result = parseInvoiceSync(wrap(faInner, subjects));
    if (!result.ok) throw new Error(`Expected a valid invoice, got: ${result.error}`);
    return result.invoice;
};

describe('mapToInvoice', () => {
    it('maps FA(3) dates, number and currency', () => {
        const invoice = parse(
            '<KodWaluty>EUR</KodWaluty><P_1>2026-02-15</P_1><P_2>FV2026/02/150</P_2><P_6>2026-01-27</P_6><P_15>100</P_15>',
        );

        expect(invoice.issueDate).toBe('2026-02-15');
        expect(invoice.invoiceNumber).toBe('FV2026/02/150');
        expect(invoice.saleDate).toBe('2026-01-27');
        expect(invoice.currency).toBe('EUR');
    });

    it('maps FA(3) addresses and decodes entities in names', () => {
        const invoice = parse('<P_2>FV/1</P_2>');

        expect(invoice.seller.name).toBe('Soft & House');
        expect(invoice.seller.addressLines).toEqual(['ul. Programistów 1 m. 2', '00-001 Warszawa']);
        expect(invoice.buyer.addressLines).toEqual(['Hauptstrasse 7', '10115 Berlin', 'DE']);
    });

    it('falls back to FA(2) AdresPol', () => {
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Faktura>
    <Podmiot1>
        <DaneIdentyfikacyjne><NIP>0123456789</NIP><Nazwa>Seller</Nazwa></DaneIdentyfikacyjne>
    </Podmiot1>
    <Podmiot2>
        <DaneIdentyfikacyjne><NIP>9876543210</NIP><Nazwa>Buyer</Nazwa></DaneIdentyfikacyjne>
        <Adres>
            <AdresPol>
                <KodKraju>PL</KodKraju>
                <Ulica>Polna</Ulica>
                <NrDomu>1</NrDomu>
                <NrLokalu>2</NrLokalu>
                <Miejscowosc>Warszawa</Miejscowosc>
                <KodPocztowy>00-001</KodPocztowy>
            </AdresPol>
        </Adres>
    </Podmiot2>
    <Fa><P_2>FV/1</P_2></Fa>
</Faktura>`;

        const result = parseInvoiceSync(xml);
        expect(result.ok).toBe(true);
        if (!result.ok) return;

        expect(result.invoice.buyer.addressLines).toEqual(['Polna 1/2', '00-001 Warszawa', 'PL']);
    });

    it('maps annotations from 1/2 codes', () => {
        const invoice = parse(
            '<P_2>FV/1</P_2><Adnotacje><P_16>1</P_16><P_17>2</P_17><P_18>1</P_18><P_18A>2</P_18A></Adnotacje>',
        );

        expect(invoice.annotations).toEqual(['Metoda kasowa', 'Mechanizm podzielonej płatności (MPP)']);
    });

    it('survives a missing Adnotacje section', () => {
        const invoice = parse('<P_2>FV/1</P_2>');

        expect(invoice.annotations).toEqual([]);
    });

    it('aggregates every VAT rate and ignores VAT-in-PLN fields', () => {
        const invoice = parse(`
            <P_2>FV/1</P_2>
            <P_13_1>100</P_13_1><P_14_1>23</P_14_1>
            <P_13_2>50</P_13_2><P_14_2>4</P_14_2>
            <P_13_3>20</P_13_3><P_14_3>1</P_14_3>
            <P_13_6_2>10</P_13_6_2>
            <P_13_11>5</P_13_11>
            <P_14_1W>999</P_14_1W>
            <P_15>213</P_15>
        `);

        expect(invoice.vatBreakdown).toEqual([
            { label: '23%', net: 100, vat: 23 },
            { label: '8%', net: 50, vat: 4 },
            { label: '5%', net: 20, vat: 1 },
            { label: '0% eksport', net: 10, vat: 0 },
            { label: '0% nowe środki transportu', net: 5, vat: 0 },
        ]);
    });

    it('normalizes a single line item to an array', () => {
        const invoice = parse(`
            <P_2>FV/1</P_2>
            <FaWiersz><NrWierszaFa>1</NrWierszaFa><P_7>Item</P_7></FaWiersz>
        `);

        expect(invoice.lines).toHaveLength(1);
    });

    it('formats VAT rate codes and maps line data', () => {
        const invoice = parse(`
            <P_2>FV/1</P_2>
            <FaWiersz>
                <NrWierszaFa>1</NrWierszaFa>
                <P_7>Usługa</P_7>
                <P_8A>szt.</P_8A>
                <P_8B>2</P_8B>
                <P_9A>100.50</P_9A>
                <P_11>201.00</P_11>
                <P_12>zw</P_12>
            </FaWiersz>
            <FaWiersz>
                <NrWierszaFa>2</NrWierszaFa>
                <P_7>Eksport</P_7>
                <P_8A>szt.</P_8B>
                <P_12>0 WDT</P_12>
            </FaWiersz>
        `);

        expect(invoice.lines[0]).toMatchObject({
            ordinal: 1,
            name: 'Usługa',
            unit: 'szt.',
            quantity: 2,
            unitPriceNet: 100.5,
            lineNet: 201,
            vatRate: 'zw.',
        });
        expect(invoice.lines[1].vatRate).toBe('0% WDT');
    });

    it('prefers the settlement amount when Rozliczenie.DoZaplaty is present', () => {
        const invoice = parse(
            '<P_2>FV/1</P_2><P_15>31.5</P_15><Rozliczenie><DoZaplaty>36.5</DoZaplaty></Rozliczenie>',
        );

        expect(invoice.totalGross).toBe(31.5);
        expect(invoice.amountDue).toBe(36.5);
    });

    it('maps the invoice type label', () => {
        const invoice = parse('<P_2>FV/1</P_2><RodzajFaktury>KOR</RodzajFaktury>');

        expect(invoice.invoiceTypeLabel).toBe('Faktura korygująca');
    });

    it('does not expose an identifier when the buyer has BrakID', () => {
        const invoice = parse('<P_2>FV/1</P_2>', '');
        const xml = wrap('<P_2>FV/1</P_2>').replace(
            /<DaneIdentyfikacyjne><NIP>9876543210<\/NIP><Nazwa>Buyer<\/Nazwa><\/DaneIdentyfikacyjne>/,
            '<DaneIdentyfikacyjne><BrakID>1</BrakID><Nazwa>Buyer</Nazwa></DaneIdentyfikacyjne>',
        );
        const result = parseInvoiceSync(xml);

        expect(invoice.buyer.identifier).toEqual({ label: 'NIP', value: '9876543210' });
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.invoice.buyer.identifier).toBeUndefined();
        }
    });
});

describe('decodeXmlEntities', () => {
    it('decodes predefined and numeric entities only', () => {
        expect(decodeXmlEntities('A &amp; B &lt; C &#65; &#x42; &custom;')).toBe('A & B < C A B &custom;');
    });
});
