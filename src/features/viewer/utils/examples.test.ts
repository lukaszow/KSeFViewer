import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseKsefXml } from './ksefParser';
import { mapToInvoice } from './invoiceMapper';
import { validateInvoice } from './ksefValidators';
import type { KSeFInvoiceBody } from '../../../core/types/ksef.types';

const examplesDir = path.resolve(process.cwd(), 'examples');
const exampleFiles = readdirSync(examplesDir)
    .filter((fileName) => fileName.toLowerCase().endsWith('.xml'))
    .sort();

const toNumber = (value: unknown): number | undefined => {
    if (typeof value !== 'string') return undefined;
    const parsed = Number(value.replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : undefined;
};

const sumRates = (body: KSeFInvoiceBody, prefix: 'P_13_' | 'P_14_'): number => {
    let total = 0;
    for (const key of Object.keys(body)) {
        if (!key.startsWith('P_13_')) continue;
        const target = prefix === 'P_13_' ? key : key.replace('P_13_', 'P_14_');
        total += toNumber(body[target]) ?? 0;
    }
    return total;
};

const lineCount = (body: KSeFInvoiceBody): number => {
    if (!body.FaWiersz) return 0;
    return Array.isArray(body.FaWiersz) ? body.FaWiersz.length : 1;
};

describe('official FA(3) examples', () => {
    it('ships the reference invoices', () => {
        expect(exampleFiles.length).toBe(26);
    });

    it('parses and maps every reference invoice without data loss', () => {
        for (const fileName of exampleFiles) {
            const xml = readFileSync(path.join(examplesDir, fileName), 'utf8');
            const parsed = parseKsefXml(xml);

            expect(parsed.ok, `${fileName}: ${parsed.ok ? '' : parsed.error}`).toBe(true);
            if (!parsed.ok) continue;

            const body = parsed.raw.Fa;
            expect(body, `${fileName}: missing Fa`).toBeDefined();
            if (!body) continue;

            const invoice = mapToInvoice(parsed.raw);

            expect(invoice.invoiceNumber, fileName).toBe(body.P_2);
            expect(invoice.issueDate, fileName).toBe(body.P_1);
            expect(invoice.currency, fileName).toBe(body.KodWaluty);
            expect(invoice.seller.name, fileName).not.toBe('—');
            expect(invoice.seller.addressLines.length, fileName).toBeGreaterThan(0);
            // Simplified invoices (UPR) may legally omit the buyer address and name.
            expect(
                invoice.buyer.name !== '—' || invoice.buyer.identifier !== undefined,
                `${fileName}: buyer identity`,
            ).toBe(true);
            expect(invoice.lines.length, fileName).toBe(lineCount(body));

            const netFromRates = sumRates(body, 'P_13_');
            const vatFromRates = sumRates(body, 'P_14_');
            const netFromBreakdown = invoice.vatBreakdown.reduce((sum, row) => sum + row.net, 0);
            const vatFromBreakdown = invoice.vatBreakdown.reduce((sum, row) => sum + row.vat, 0);

            expect(netFromBreakdown, `${fileName}: net`).toBeCloseTo(netFromRates, 2);
            expect(vatFromBreakdown, `${fileName}: vat`).toBeCloseTo(vatFromRates, 2);

            if (invoice.vatBreakdown.length > 0 && invoice.totalGross !== undefined) {
                expect(
                    Math.abs(netFromBreakdown + vatFromBreakdown - invoice.totalGross),
                    `${fileName}: gross`,
                ).toBeLessThanOrEqual(0.02);
            }

            for (const line of invoice.lines) {
                expect(line.name, `${fileName}: line name`).not.toBe('—');
                expect(line.vatRate, `${fileName}: VAT rate`).not.toContain('undefined');
            }

            expect(validateInvoice(invoice), fileName).toEqual([]);
        }
    });
});
