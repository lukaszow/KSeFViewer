import { KSeFSubject } from '../../../core/types/ksef.types';

interface InvoiceHeaderProps {
    seller: KSeFSubject;
    buyer: KSeFSubject;
    invoiceNumber: string;
    issueDate: string;
    saleDate?: string;
}

const InvoiceHeader = ({ seller, buyer, invoiceNumber, issueDate, saleDate }: InvoiceHeaderProps) => {
    return (
        <div className="flex flex-col gap-10">
            {/* Top Section: Title & Dates */}
            <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold text-slate-900 leading-tight">FAKTURA</h1>
                    <p className="text-lg font-medium text-blue-600">nr {invoiceNumber}</p>
                </div>

                <div className="text-right text-sm text-slate-600 space-y-1 bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <p>Data wystawienia: <span className="font-semibold text-slate-900">{issueDate}</span></p>
                    {saleDate && (
                        <p>Data sprzedaży: <span className="font-semibold text-slate-900">{saleDate}</span></p>
                    )}
                </div>
            </div>

            {/* Subjects Section */}
            <div className="grid grid-cols-2 gap-12">
                {/* Seller */}
                <div className="flex flex-col gap-3">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Sprzedawca</h2>
                    <div className="flex flex-col">
                        <p className="font-bold text-lg text-slate-900">{seller.DaneIdentyfikacyjne.Nazwa}</p>
                        <p className="text-slate-600">NIP: <span className="font-medium">{seller.DaneIdentyfikacyjne.NIP}</span></p>
                        {seller.Adres.AdresPol && (
                            <div className="mt-2 text-slate-600 leading-relaxed">
                                <p>{seller.Adres.AdresPol.Ulica} {seller.Adres.AdresPol.NrDomu}{seller.Adres.AdresPol.NrLokalu ? `/${seller.Adres.AdresPol.NrLokalu}` : ''}</p>
                                <p>{seller.Adres.AdresPol.KodPocztowy} {seller.Adres.AdresPol.Miejscowosc}</p>
                                <p>{seller.Adres.AdresPol.KodKraju}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Buyer */}
                <div className="flex flex-col gap-3">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Nabywca</h2>
                    <div className="flex flex-col">
                        <p className="font-bold text-lg text-slate-900">{buyer.DaneIdentyfikacyjne.Nazwa}</p>
                        <p className="text-slate-600">NIP: <span className="font-medium">{buyer.DaneIdentyfikacyjne.NIP}</span></p>
                        {buyer.Adres.AdresPol && (
                            <div className="mt-2 text-slate-600 leading-relaxed">
                                <p>{buyer.Adres.AdresPol.Ulica} {buyer.Adres.AdresPol.NrDomu}{buyer.Adres.AdresPol.NrLokalu ? `/${buyer.Adres.AdresPol.NrLokalu}` : ''}</p>
                                <p>{buyer.Adres.AdresPol.KodPocztowy} {buyer.Adres.AdresPol.Miejscowosc}</p>
                                <p>{buyer.Adres.AdresPol.KodKraju}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceHeader;
