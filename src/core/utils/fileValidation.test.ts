import { describe, expect, it } from 'vitest';
import { MAX_FILE_SIZE, validateInvoiceFileMeta } from './fileValidation';

const file = (name: string, type: string, size = 1024) => ({ name, type, size });

describe('validateInvoiceFileMeta', () => {
    it('accepts XML files with a known MIME type', () => {
        expect(validateInvoiceFileMeta(file('faktura.xml', 'application/xml'))).toBeNull();
        expect(validateInvoiceFileMeta(file('faktura.XML', 'text/xml'))).toBeNull();
    });

    it('accepts an empty MIME type reported by some platforms', () => {
        expect(validateInvoiceFileMeta(file('faktura.xml', ''))).toBeNull();
    });

    it('rejects non-XML extensions and MIME types', () => {
        expect(validateInvoiceFileMeta(file('faktura.pdf', 'application/pdf'))).not.toBeNull();
        expect(validateInvoiceFileMeta(file('faktura.xml', 'text/html'))).not.toBeNull();
    });

    it('rejects files above 10 MB', () => {
        expect(validateInvoiceFileMeta(file('faktura.xml', 'application/xml', MAX_FILE_SIZE + 1))).not.toBeNull();
    });
});
