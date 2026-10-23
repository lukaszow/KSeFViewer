import { useState } from 'react';
import { Loader2, Printer } from 'lucide-react';
import type { Invoice } from './core/types/invoice.types';
import type { ParseErrorCode } from './features/viewer/utils/ksefParser';
import { DEMO_XML } from './core/config/demoData';
import { parseInvoice } from './features/viewer/utils/parseInvoice';
import { validateInvoiceFileMeta } from './core/utils/fileValidation';

// UI Components
import AppVersion from './components/ui/AppVersion';
import Button from './components/ui/Button';
import FileDropzone from './components/ui/FileDropzone';
import SecurityInfo from './components/ui/SecurityInfo';
import InvoicePaper from './features/viewer/components/InvoicePaper';

type ViewMode = 'view' | 'raw';

interface LoadedDocument {
    fileName: string;
    rawXml: string;
    invoice: Invoice;
}

const ERROR_MESSAGES: Record<ParseErrorCode, string> = {
    too_large: 'Plik jest zbyt duży. Maksymalny rozmiar to 10 MB.',
    invalid_xml: 'Nie udało się przetworzyć pliku XML. Sprawdź, czy plik jest poprawny.',
    not_ksef: 'Plik nie zawiera faktury KSeF (brak elementu <Faktura>).',
    missing_sections:
        'Plik nie zawiera wymaganych sekcji faktury (Podmiot1, Podmiot2 lub Fa).',
};

function App() {
    const [viewMode, setViewMode] = useState<ViewMode>('view');
    const [document, setDocument] = useState<LoadedDocument | null>(null);
    const [pendingFileName, setPendingFileName] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const loadFromXml = async (xml: string, fileName: string) => {
        setPendingFileName(fileName);
        try {
            const result = await parseInvoice(xml);
            if (!result.ok) {
                setError(ERROR_MESSAGES[result.error]);
                return;
            }
            setDocument({ fileName, rawXml: xml, invoice: result.invoice });
            setViewMode('view');
        } finally {
            setPendingFileName(null);
        }
    };

    const handleFileSelect = async (file: File) => {
        setError(null);

        const validationError = validateInvoiceFileMeta(file);
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            await loadFromXml(await file.text(), file.name);
        } catch {
            setError('Błąd odczytu pliku.');
        }
    };

    const loadDemo = () => {
        setError(null);
        void loadFromXml(DEMO_XML, 'faktura_demo.xml');
    };

    const reset = () => {
        setDocument(null);
        setError(null);
        setViewMode('view');
    };

    const isLoading = pendingFileName !== null;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 selection:bg-blue-100 transition-colors duration-500">
            {/* Navbar */}
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 sticky top-0 z-50 flex items-center justify-between shadow-sm print:hidden">
                <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-2.5 rounded-xl font-black text-xl shadow-lg shadow-blue-100 rotate-1">
                        KSeF
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">CzytajKSEF.pl</h1>
                        {document && <span className="text-xs text-slate-500 font-bold mt-1.5 uppercase tracking-widest">{document.fileName}</span>}
                    </div>
                </div>

                {document && (
                    <div className="flex items-center gap-6">
                        <div className="bg-slate-100 p-1.5 rounded-xl flex gap-1" role="group" aria-label="Tryb widoku">
                            <Button
                                variant={viewMode === 'view' ? 'primary' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('view')}
                                aria-pressed={viewMode === 'view'}
                                className="rounded-lg px-6"
                            >
                                Podgląd
                            </Button>
                            <Button
                                variant={viewMode === 'raw' ? 'primary' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('raw')}
                                aria-pressed={viewMode === 'raw'}
                                className="rounded-lg px-6"
                            >
                                XML
                            </Button>
                        </div>
                        {viewMode === 'view' && (
                            <Button variant="outline" size="sm" onClick={() => window.print()} className="border-slate-300 font-bold">
                                <Printer className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                                Drukuj
                            </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={reset} className="border-slate-300 font-bold">
                            Wgraj nowy
                        </Button>
                    </div>
                )}
            </header>

            <main className="flex-1 overflow-auto" aria-busy={isLoading}>
                {isLoading ? (
                    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
                        <Loader2 className="h-10 w-10 animate-spin text-blue-600" aria-hidden="true" />
                        <p role="status" className="text-slate-600 font-medium">
                            Przetwarzanie pliku…
                        </p>
                        <p className="text-xs uppercase tracking-widest text-slate-400">{pendingFileName}</p>
                    </div>
                ) : document ? (
                    <div className="min-h-full py-12 print:py-0">
                        {viewMode === 'view' && <InvoicePaper invoice={document.invoice} />}

                        {viewMode === 'raw' && (
                            <div className="max-w-6xl mx-auto px-8">
                                <div className="bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-800">
                                    <div className="bg-slate-800/50 px-6 py-3 border-b border-slate-700 flex justify-between items-center">
                                        <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Source XML</span>
                                        <div className="flex gap-1.5" aria-hidden="true">
                                            <div className="w-3 h-3 rounded-full bg-red-500/20" />
                                            <div className="w-3 h-3 rounded-full bg-amber-500/20" />
                                            <div className="w-3 h-3 rounded-full bg-emerald-500/20" />
                                        </div>
                                    </div>
                                    <pre
                                        tabIndex={0}
                                        aria-label="Źródło XML faktury"
                                        className="p-8 text-sm font-mono text-blue-100/80 leading-relaxed whitespace-pre-wrap overflow-auto max-h-[70vh]"
                                    >
                                        {document.rawXml}
                                    </pre>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="max-w-5xl mx-auto p-12">
                        <FileDropzone onFileSelect={handleFileSelect} error={error} />

                        <div className="mt-12 flex flex-col items-center gap-8">
                            <div className="flex gap-4">
                                <Button variant="ghost" className="text-slate-400 font-bold hover:text-blue-600" onClick={loadDemo}>
                                    Załaduj dane testowe (Demo)
                                </Button>
                            </div>
                            <SecurityInfo />
                        </div>
                    </div>
                )}
            </main>

            <footer className="py-8 bg-white border-t border-slate-100 text-center print:hidden">
                <p className="text-slate-400 text-xs font-medium uppercase tracking-[0.2em]">
                    Built with Privacy & Precision • 2026
                </p>
            </footer>

            <AppVersion />
        </div>
    );
}

export default App;
