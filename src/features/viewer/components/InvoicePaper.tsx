import { KSeFInvoice } from '../../../core/types/ksef.types';
import InvoiceHeader from './InvoiceHeader';
import InvoiceTable from './InvoiceTable';
import InvoiceSummary from './InvoiceSummary';

interface InvoicePaperProps {
    invoice: KSeFInvoice;
}

/**
 * Main container for the invoice visualization.
 * Designed to resemble a physical A4 document.
 */
const InvoicePaper = ({ invoice }: InvoicePaperProps) => {
    return (
        <div className="max-w-[210mm] mx-auto my-8 bg-white shadow-2xl border border-slate-200 p-[20mm] min-h-[297mm] flex flex-col gap-8 print:shadow-none print:border-none print:m-0">
            <InvoiceHeader
                seller={invoice.Podmiot1}
                buyer={invoice.Podmiot2}
                invoiceNumber={invoice.Fa.P_1}
                issueDate={invoice.Fa.P_2}
                saleDate={invoice.Fa.P_6}
            />

            <div className="flex-grow">
                <InvoiceTable items={invoice.Fa.FaWiersz} />
            </div>

            <InvoiceSummary
                totalGross={invoice.Fa.P_15}
                totalNet23={invoice.Fa.P_13_1}
                totalVat23={invoice.Fa.P_14_1}
                currency={invoice.Naglowek.KodWaluty}
            />

            {/* Footer / Annotations */}
            {(invoice.Fa.Adnotacje.P_16 === 1 || invoice.Fa.Adnotacje.P_18 === 1) && (
                <div className="mt-8 pt-4 border-t border-slate-100 text-xs text-slate-500 flex gap-4">
                    {invoice.Fa.Adnotacje.P_16 === 1 && (
                        <span className="px-2 py-1 bg-slate-50 rounded border border-slate-100 font-medium">Metoda kasowa</span>
                    )}
                    {invoice.Fa.Adnotacje.P_18 === 1 && (
                        <span className="px-2 py-1 bg-slate-50 rounded border border-slate-100 font-medium">Mechanizm podzielonej płatności (MPP)</span>
                    )}
                </div>
            )}
        </div>
    );
};

export default InvoicePaper;
