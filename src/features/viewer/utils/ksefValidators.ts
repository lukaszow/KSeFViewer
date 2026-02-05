import { KSeFInvoice } from '../../../core/types/ksef.types';

/**
 * Validates mathematical consistency of the invoice.
 * Checks if sum of line items matches the total net amount.
 * Note: Real-world VAT math can be complex due to rounding, 
 * this is a basic sanity check.
 */
export const validateInvoiceMath = (invoice: KSeFInvoice): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const body = invoice.Fa;

    if (!body.FaWiersz) return { isValid: true, errors: [] };

    const items = Array.isArray(body.FaWiersz) ? body.FaWiersz : [body.FaWiersz];

    const calculatedTotalNet = items.reduce((sum, item) => sum + (item.P_11 || 0), 0);

    // P_13_1 is Net Amount for 23% VAT (referencing DOCS_KSEF_SCHEMA.md)
    // In a full implementation, we would sum all P_13_x fields.
    const reportedTotalNet = body.P_13_1 || 0;

    // Allowing 1 cent difference for rounding
    if (Math.abs(calculatedTotalNet - reportedTotalNet) > 0.01) {
        errors.push(`Suma wierszy (${calculatedTotalNet}) nie zgadza się z wartością netto (${reportedTotalNet}).`);
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Validates logical dates.
 */
export const validateInvoiceDates = (invoice: KSeFInvoice): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const { P_2: issueDate, P_6: saleDate } = invoice.Fa;

    if (issueDate && saleDate) {
        if (new Date(issueDate) < new Date(saleDate)) {
            // It's allowed in Poland to issue invoice after sale, but usually not too late.
            // This is just a placeholder for logic.
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};
