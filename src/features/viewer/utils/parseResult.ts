import type { Invoice } from '../../../core/types/invoice.types';
import type { ParseErrorCode } from './ksefParser';

export type InvoiceParseResult =
    | { ok: true; invoice: Invoice }
    | { ok: false; error: ParseErrorCode };
