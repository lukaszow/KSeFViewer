import type { InvoiceParty } from '../../../core/types/invoice.types';
import { formatDate } from '../../../core/utils/format';

interface InvoiceHeaderProps {
    seller: InvoiceParty;
    buyer: InvoiceParty;
    invoiceNumber: string;
    issueDate?: string;
    saleDate?: string;
    invoiceTypeLabel?: string;
}

interface PartyBlockProps {
    title: string;
    party: InvoiceParty;
}

const PartyBlock = ({ title, party }: PartyBlockProps) => (
    <div className="flex flex-col gap-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">{title}</h2>
        <div className="flex flex-col">
            <p className="font-bold text-lg text-slate-900">{party.name}</p>
            {party.identifier && (
                <p className="text-slate-600">
                    {party.identifier.label}:{' '}
                    <span className="font-medium">{party.identifier.value}</span>
                </p>
            )}
            {party.addressLines.length > 0 && (
                <div className="mt-2 text-slate-600 leading-relaxed">
                    {party.addressLines.map((line, index) => (
                        <p key={`${line}-${index}`}>{line}</p>
                    ))}
                </div>
            )}
        </div>
    </div>
);

const InvoiceHeader = ({
    seller,
    buyer,
    invoiceNumber,
    issueDate,
    saleDate,
    invoiceTypeLabel,
}: InvoiceHeaderProps) => {
    return (
        <div className="flex flex-col gap-10">
            {/* Top Section: Title & Dates */}
            <div className="flex justify-between items-start gap-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold text-slate-900 leading-tight">FAKTURA</h1>
                    <p className="text-lg font-medium text-blue-600">nr {invoiceNumber}</p>
                    {invoiceTypeLabel && (
                        <span className="mt-1 self-start rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                            {invoiceTypeLabel}
                        </span>
                    )}
                </div>

                <div className="text-right text-sm text-slate-600 space-y-1 bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <p>Data wystawienia: <span className="font-semibold text-slate-900">{formatDate(issueDate)}</span></p>
                    {saleDate && (
                        <p>Data sprzedaży: <span className="font-semibold text-slate-900">{formatDate(saleDate)}</span></p>
                    )}
                </div>
            </div>

            {/* Subjects Section */}
            <div className="grid grid-cols-2 gap-12">
                <PartyBlock title="Sprzedawca" party={seller} />
                <PartyBlock title="Nabywca" party={buyer} />
            </div>
        </div>
    );
};

export default InvoiceHeader;
