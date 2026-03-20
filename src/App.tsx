import { useState } from 'react';
import { KSeFInvoice } from './core/types/ksef.types';
import { parseKsefXml } from './features/viewer/utils/ksefParser';
import { DEMO_INVOICE } from './core/config/demoData';

// UI Components
import Button from './components/ui/Button';
import FileDropzone from './components/ui/FileDropzone';
import SecurityInfo from './components/ui/SecurityInfo';
import InvoicePaper from './features/viewer/components/InvoicePaper';

function App() {
    const [viewMode, setViewMode] = useState<'upload' | 'view' | 'raw'>('upload');
    const [rawXml, setRawXml] = useState<string | null>(null);
    const [invoice, setInvoice] = useState<KSeFInvoice | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileSelect = (file: File) => {
        setError(null);
        if (!file.name.endsWith('.xml')) {
            setError('Proszę przesłać poprawny plik XML.');
            return;
        }
        if (file.type && !['application/xml', 'text/xml'].includes(file.type)) {
            setError('Proszę przesłać poprawny plik XML.');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            setError('Plik jest zbyt duży. Maksymalny rozmiar to 10 MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result;
            if (typeof text === 'string') {
                const parsed = parseKsefXml(text);
                if (parsed) {
                    setInvoice(parsed);
                    setRawXml(text);
                    setFileName(file.name);
                    setViewMode('view');
                } else {
                    setError('Nie udało się odczytać danych faktury. Sprawdź czy plik jest zgodny ze schematem KSeF.');
                }
            }
        };
        reader.onerror = () => setError('Błąd odczytu pliku.');
        reader.readAsText(file);
    };

    const loadDemo = () => {
        setInvoice(DEMO_INVOICE);
        setRawXml('<!-- Demo Data -->');
        setFileName('faktura_demo.xml');
        setViewMode('view');
    };

    const reset = () => {
        setInvoice(null);
        setRawXml(null);
        setFileName(null);
        setError(null);
        setViewMode('upload');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 selection:bg-blue-100 italic-headings transition-colors duration-500">
            {/* Navbar */}
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 sticky top-0 z-50 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-2.5 rounded-xl font-black text-xl shadow-lg shadow-blue-100 rotate-1">
                        KSeF
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">Viewer.pl</h1>
                        {fileName && <span className="text-xs text-slate-500 font-bold mt-1.5 uppercase tracking-widest">{fileName}</span>}
                    </div>
                </div>

                {viewMode !== 'upload' && (
                    <div className="flex items-center gap-6">
                        <div className="bg-slate-100 p-1.5 rounded-xl flex gap-1">
                            <Button
                                variant={viewMode === 'view' ? 'primary' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('view')}
                                className="rounded-lg px-6"
                            >
                                Podgląd
                            </Button>
                            <Button
                                variant={viewMode === 'raw' ? 'primary' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('raw')}
                                className="rounded-lg px-6"
                            >
                                XML
                            </Button>
                        </div>
                        <Button variant="outline" size="sm" onClick={reset} className="border-slate-300 font-bold">
                            Wgraj nowy
                        </Button>
                    </div>
                )}
            </header>

            <main className="flex-1 overflow-auto">
                {viewMode === 'upload' ? (
                    <div className="max-w-5xl mx-auto p-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
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
                ) : (
                    <div className="min-h-full py-12 animate-in fade-in zoom-in-95 duration-500">
                        {viewMode === 'view' && invoice && <InvoicePaper invoice={invoice} />}

                        {viewMode === 'raw' && (
                            <div className="max-w-6xl mx-auto px-8">
                                <div className="bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-800">
                                    <div className="bg-slate-800/50 px-6 py-3 border-b border-slate-700 flex justify-between items-center">
                                        <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Source XML</span>
                                        <div className="flex gap-1.5">
                                            <div className="w-3 h-3 rounded-full bg-red-500/20" />
                                            <div className="w-3 h-3 rounded-full bg-amber-500/20" />
                                            <div className="w-3 h-3 rounded-full bg-emerald-500/20" />
                                        </div>
                                    </div>
                                    <pre className="p-8 text-sm font-mono text-blue-100/80 leading-relaxed whitespace-pre-wrap overflow-auto max-h-[70vh]">
                                        {rawXml}
                                    </pre>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>

            <footer className="py-8 bg-white border-t border-slate-100 text-center">
                <p className="text-slate-400 text-xs font-medium uppercase tracking-[0.2em]">
                    Built with Privacy & Precision • 2026
                </p>
            </footer>
        </div>
    );
}

export default App;
