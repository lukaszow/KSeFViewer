import { KSeFLineItem } from '../../../core/types/ksef.types';

interface InvoiceTableProps {
    items?: KSeFLineItem | KSeFLineItem[];
}

const InvoiceTable = ({ items }: InvoiceTableProps) => {
    const itemList = Array.isArray(items) ? items : items ? [items] : [];

    return (
        <div className="mt-8">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b-2 border-slate-900 text-xs font-bold uppercase tracking-wider text-slate-500">
                        <th className="py-3 px-2 w-10 text-center">Lp.</th>
                        <th className="py-3 px-2">Nazwa towaru lub usługi</th>
                        <th className="py-3 px-2 text-right">Cena netto</th>
                        <th className="py-3 px-2 text-center w-24">Stawka VAT</th>
                        <th className="py-3 px-2 text-right">Wartość netto</th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {itemList.map((item, index) => (
                        <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="py-4 px-2 text-center text-slate-400 font-medium">{item.NrWierszaFa || index + 1}</td>
                            <td className="py-4 px-2 font-medium text-slate-800">{item.P_7}</td>
                            <td className="py-4 px-2 text-right font-mono text-slate-600">
                                {item.P_9A?.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="py-4 px-2 text-center">
                                <span className="px-2 py-1 bg-slate-100 rounded text-xs font-bold text-slate-600">
                                    {item.P_12}%
                                </span>
                            </td>
                            <td className="py-4 px-2 text-right font-bold text-slate-900 font-mono">
                                {item.P_11?.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                        </tr>
                    ))}
                    {itemList.length === 0 && (
                        <tr>
                            <td colSpan={5} className="py-12 text-center text-slate-400 italic">
                                Brak pozycji na fakturze
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default InvoiceTable;
