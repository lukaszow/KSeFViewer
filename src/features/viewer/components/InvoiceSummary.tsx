import type { VatRateSummary } from '../../../core/types/invoice.types';
import { formatAmount } from '../../../core/utils/format';

interface InvoiceSummaryProps {
    vatBreakdown: VatRateSummary[];
    totalGross?: number;
    amountDue?: number;
    currency: string;
}

const InvoiceSummary = ({ vatBreakdown, totalGross, amountDue, currency }: InvoiceSummaryProps) => {
    const payable = amountDue ?? totalGross;
    const showGrossRow =
        totalGross !== undefined &&
        payable !== undefined &&
        Math.abs(payable - totalGross) >= 0.005;

    return (
        <div className="flex justify-end mt-12">
            <div className="w-1/2 min-w-[320px] space-y-4">
                {/* VAT Grid */}
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                    <table className="w-full border-collapse">
                        <caption className="sr-only">Podsumowanie stawek VAT</caption>
                        <thead>
                            <tr className="text-xs font-bold uppercase text-slate-400 border-b border-slate-200">
                                <th scope="col" className="text-left pb-3">Stawka</th>
                                <th scope="col" className="text-right pb-3">Netto</th>
                                <th scope="col" className="text-right pb-3">VAT</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {vatBreakdown.map((row, index) => (
                                <tr key={`${row.label}-${index}`} className="border-b border-slate-100 last:border-0">
                                    <th scope="row" className="py-3 text-left font-bold">{row.label}</th>
                                    <td className="py-3 text-right font-mono">{formatAmount(row.net)}</td>
                                    <td className="py-3 text-right font-mono">{formatAmount(row.vat)}</td>
                                </tr>
                            ))}
                            {vatBreakdown.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="py-3 text-center text-slate-400 italic">
                                        Brak danych o stawkach VAT
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {showGrossRow && (
                    <div className="flex justify-between items-center px-2 text-sm text-slate-600">
                        <span>Razem brutto</span>
                        <span className="font-mono font-semibold">
                            {formatAmount(totalGross)} {currency}
                        </span>
                    </div>
                )}

                {/* Grand Total */}
                <div className="flex justify-between items-center bg-blue-600 text-white p-6 rounded-xl shadow-lg shadow-blue-200">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold uppercase opacity-80 tracking-widest">Razem do zapłaty</span>
                        <span className="text-sm font-medium opacity-90">{currency}</span>
                    </div>
                    <div className="text-4xl font-black">
                        {formatAmount(payable)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceSummary;
