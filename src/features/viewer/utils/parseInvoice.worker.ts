import { parseKsefXml } from './ksefParser';
import { mapToInvoice } from './invoiceMapper';
import type { InvoiceParseResult } from './parseResult';

const workerScope = self as unknown as {
    addEventListener: (type: 'message', listener: (event: MessageEvent<string>) => void) => void;
    postMessage: (message: InvoiceParseResult) => void;
};

workerScope.addEventListener('message', (event) => {
    const parsed = parseKsefXml(event.data);
    workerScope.postMessage(
        parsed.ok ? { ok: true, invoice: mapToInvoice(parsed.raw) } : parsed,
    );
});
