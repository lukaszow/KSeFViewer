import type { InvoiceLine } from '../../../core/types/invoice.types';
import { formatAmount, formatQuantity } from '../../../core/utils/format';

interface InvoiceTableProps {
    items: InvoiceLine[];
}

const InvoiceTable = ({ items }: InvoiceTableProps) => {
    return (
        <div className="mt-8">
            <table className="w-full text-left border-collapse">
                <caption className="sr-only">Pozycje faktury</caption>
                <thead>
                    <tr className="border-b-2 border-slate-900 text-xs font-bold uppercase tracking-wider text-slate-500">
                        <th scope="col" className="py-3 px-2 w-10 text-center">Lp.</th>
                        <th scope="col" className="py-3 px-2">Nazwa towaru lub usługi</th>
                        <th scope="col" className="py-3 px-2 text-right">Ilość</th>
                        <th scope="col" className="py-3 px-2 text-right">Cena netto</th>
                        <th scope="col" className="py-3 px-2 text-center w-24">Stawka VAT</th>
                        <th scope="col" className="py-3 px-2 text-right">Wartość netto</th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {items.map((item, index) => {
                        const lineNet = item.lineNet ?? item.lineNetForeign;

                        return (
                            <tr key={`${item.ordinal}-${index}`} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                <td className="py-4 px-2 text-center text-slate-400 font-medium">{item.ordinal}</td>
                                <td className="py-4 px-2 font-medium text-slate-800">{item.name}</td>
                                <td className="py-4 px-2 text-right font-mono text-slate-600 whitespace-nowrap">
                                    {formatQuantity(item.quantity)}
                                    {item.unit ? ` ${item.unit}` : ''}
                                </td>
                                <td className="py-4 px-2 text-right font-mono text-slate-600">
                                    {formatAmount(item.unitPriceNet)}
                                </td>
                                <td className="py-4 px-2 text-center">
                                    <span className="px-2 py-1 bg-slate-100 rounded text-xs font-bold text-slate-600">
                                        {item.vatRate}
                                    </span>
                                </td>
                                <td className="py-4 px-2 text-right font-bold text-slate-900 font-mono">
                                    {formatAmount(lineNet)}
                                </td>
                            </tr>
                        );
                    })}
                    {items.length === 0 && (
                        <tr>
                            <td colSpan={6} className="py-12 text-center text-slate-400 italic">
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
