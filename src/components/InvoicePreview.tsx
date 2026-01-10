
import React from 'react';
import { InvoiceData } from '../utils/xmlParser';

interface InvoicePreviewProps {
    data: InvoiceData;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ data }) => {
    return (
        <div className="w-full flex justify-center py-8 bg-slate-100/50">
            {/* A4 Container */}
            <div className="bg-white shadow-lg w-[210mm] min-h-[297mm] p-[20mm] text-slate-900 font-serif relative">

                {/* Header */}
                <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold uppercase tracking-wider text-slate-800">Faktura VAT</h1>
                        <p className="text-slate-500 mt-1">Nr: <span className="text-slate-900 font-semibold">{data.header.number}</span></p>
                    </div>
                    <div className="text-right text-sm">
                        <p>Data wystawienia: <b>{data.header.date}</b></p>
                        {data.header.place && <p>Miejsce: {data.header.place}</p>}
                    </div>
                </div>

                {/* Parties */}
                <div className="grid grid-cols-2 gap-12 mb-12">
                    {/* Seller */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-200 pb-1">Sprzedawca</h3>
                        <p className="font-bold text-lg mb-1">{data.seller.name}</p>
                        <p className="text-slate-600 mb-1">NIP: {data.seller.nip}</p>
                        <p className="text-slate-600 whitespace-pre-line">{data.seller.address}</p>
                    </div>

                    {/* Buyer */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-200 pb-1">Nabywca</h3>
                        <p className="font-bold text-lg mb-1">{data.buyer.name}</p>
                        <p className="text-slate-600 mb-1">NIP: {data.buyer.nip}</p>
                        <p className="text-slate-600 whitespace-pre-line">{data.buyer.address}</p>
                    </div>
                </div>

                {/* Items Table */}
                <div className="mb-0">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-medium">
                            <tr>
                                <th className="px-4 py-3 text-left w-12">Lp.</th>
                                <th className="px-4 py-3 text-left">Nazwa towaru / usługi</th>
                                <th className="px-4 py-3 text-right">Ilość</th>
                                <th className="px-4 py-3 text-right">J.m.</th>
                                <th className="px-4 py-3 text-right">Cena netto</th>
                                <th className="px-4 py-3 text-right">Wartość netto</th>
                                <th className="px-4 py-3 text-right">VAT</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data.items.map((item, index) => (
                                <tr key={index}>
                                    <td className="px-4 py-3 text-slate-400">{index + 1}</td>
                                    <td className="px-4 py-3 font-medium">{item.name}</td>
                                    <td className="px-4 py-3 text-right">{item.quantity}</td>
                                    <td className="px-4 py-3 text-right text-slate-500">{item.unit}</td>
                                    <td className="px-4 py-3 text-right">{item.netPrice.toFixed(2)}</td>
                                    <td className="px-4 py-3 text-right">{item.netValue.toFixed(2)}</td>
                                    <td className="px-4 py-3 text-right">{item.vatRate}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Spacer to push totals down if short content */}
                <div className="py-6 border-t border-slate-800 mt-0 mb-8"></div>

                {/* Summary */}
                <div className="flex justify-end">
                    <div className="w-1/2">
                        <div className="flex justify-between py-2 border-b border-slate-200 text-sm">
                            <span className="text-slate-500">Suma netto:</span>
                            <span className="font-semibold">{data.summary.net.toFixed(2)} PLN</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-200 text-sm">
                            <span className="text-slate-500">Suma VAT:</span>
                            <span className="font-semibold">{data.summary.vat.toFixed(2)} PLN</span>
                        </div>
                        <div className="flex justify-between py-3 text-lg mt-2">
                            <span className="font-bold text-slate-800">Do zapłaty:</span>
                            <span className="font-bold text-blue-600">{data.summary.gross.toFixed(2)} PLN</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="absolute bottom-[20mm] left-[20mm] right-[20mm] text-center border-t border-slate-100 pt-4 text-xs text-slate-400">
                    Wydruk wizualizacji XML KSeF • Wygenerowano automatycznie
                </div>
            </div>
        </div>
    );
};

export default InvoicePreview;
