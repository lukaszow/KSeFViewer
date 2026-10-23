import { parseKsefXml } from './ksefParser';
import { mapToInvoice } from './invoiceMapper';
import type { InvoiceParseResult } from './parseResult';

export const parseInvoiceSync = (xml: string): InvoiceParseResult => {
    try {
        const parsed = parseKsefXml(xml);
        return parsed.ok ? { ok: true, invoice: mapToInvoice(parsed.raw) } : parsed;
    } catch {
        return { ok: false, error: 'invalid_xml' };
    }
};

/**
 * Parses an invoice off the main thread when Web Workers are available.
 * Falls back to synchronous parsing (e.g. in tests or very old browsers).
 */
export const parseInvoice = (xml: string): Promise<InvoiceParseResult> => {
    if (typeof Worker === 'undefined') {
        return Promise.resolve(parseInvoiceSync(xml));
    }

    return new Promise((resolve) => {
        let worker: Worker;
        try {
            worker = new Worker(new URL('./parseInvoice.worker.ts', import.meta.url), {
                type: 'module',
            });
        } catch {
            resolve(parseInvoiceSync(xml));
            return;
        }

        const finish = (result: InvoiceParseResult) => {
            worker.terminate();
            resolve(result);
        };

        worker.onmessage = (event: MessageEvent<InvoiceParseResult>) => finish(event.data);
        worker.onerror = () => finish(parseInvoiceSync(xml));
        worker.postMessage(xml);
    });
};
