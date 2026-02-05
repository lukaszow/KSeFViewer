interface InvoiceSummaryProps {
    totalGross: number;
    totalNet23?: number;
    totalVat23?: number;
    currency: string;
}

const InvoiceSummary = ({ totalGross, totalNet23, totalVat23, currency }: InvoiceSummaryProps) => {
    return (
        <div className="flex justify-end mt-12">
            <div className="w-1/2 space-y-4">
                {/* VAT Grid */}
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                    <div className="grid grid-cols-3 text-xs font-bold uppercase text-slate-400 pb-3 border-b border-slate-200">
                        <div>Stawka</div>
                        <div className="text-right">Netto</div>
                        <div className="text-right">VAT</div>
                    </div>
                    <div className="grid grid-cols-3 text-sm py-3 border-b border-slate-100 last:border-0">
                        <div className="font-bold">23%</div>
                        <div className="text-right font-mono">{totalNet23?.toLocaleString('pl-PL', { minimumFractionDigits: 2 })}</div>
                        <div className="text-right font-mono">{totalVat23?.toLocaleString('pl-PL', { minimumFractionDigits: 2 })}</div>
                    </div>
                </div>

                {/* Grand Total */}
                <div className="flex justify-between items-center bg-blue-600 text-white p-6 rounded-xl shadow-lg shadow-blue-200">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold uppercase opacity-80 letter-tracking-widest">Razem do zapłaty</span>
                        <span className="text-sm font-medium opacity-90">{currency}</span>
                    </div>
                    <div className="text-4xl font-black">
                        {totalGross?.toLocaleString('pl-PL', { minimumFractionDigits: 2 })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceSummary;
