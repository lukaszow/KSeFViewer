import { useState, DragEvent, ChangeEvent } from 'react';
import { parseKsefXml, InvoiceData, DEMO_INVOICE } from './utils/xmlParser';
import InvoicePreview from './components/InvoicePreview';
import logoImg from './assets/czytajksef.png';

function App() {
    // Mode: 'upload' | 'view' | 'raw'
    const [viewMode, setViewMode] = useState<'upload' | 'view' | 'raw'>('upload');

    // Data
    const [rawXml, setRawXml] = useState<string | null>(null);
    const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);

    // UI State
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const processFileContent = (name: string, content: string) => {
        setError(null);
        try {
            const data = parseKsefXml(content);
            if (data) {
                setInvoiceData(data);
                setRawXml(content);
                setFileName(name);
                setViewMode('view');
            } else {
                setError('Nie udało się odczytać danych faktury. Sprawdź format pliku.');
            }
        } catch (err) {
            console.error(err);
            setError('Wystąpił nieoczekiwany błąd podczas przetwarzania pliku.');
        }
    };

    const processFile = (file: File) => {
        setError(null);
        if (file.type !== 'text/xml' && !file.name.endsWith('.xml')) {
            setError('Proszę przesłać poprawny plik XML.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result;
            if (typeof text === 'string') {
                processFileContent(file.name, text);
            }
        };
        reader.onerror = () => setError('Błąd odczytu pliku.');
        reader.readAsText(file);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            processFile(e.target.files[0]);
        }
    };

    const loadDemo = () => {
        setInvoiceData(DEMO_INVOICE);
        setRawXml("<!-- Demo Data Loaded -->");
        setFileName("faktura_demo.xml");
        setViewMode('view');
    };

    const resetViewer = () => {
        setRawXml(null);
        setInvoiceData(null);
        setFileName(null);
        setError(null);
        setViewMode('upload');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
            {/* Navbar */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 text-white p-1.5 rounded-md font-bold text-lg">KSeF</div>
                    <div className="flex flex-col">
                        <h1 className="text-xl font-semibold text-slate-700 leading-none">CzytajKSEF.pl</h1>
                        {fileName && <span className="text-xs text-slate-500 font-medium mt-1">Plik: {fileName}</span>}
                    </div>
                </div>

                {viewMode !== 'upload' && (
                    <div className="flex items-center gap-4">
                        <div className="bg-slate-100 rounded-lg p-1 flex text-sm font-medium">
                            <button
                                onClick={() => setViewMode('view')}
                                className={`px-3 py-1.5 rounded-md transition-all ${viewMode === 'view' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Podgląd
                            </button>
                            <button
                                onClick={() => setViewMode('raw')}
                                className={`px-3 py-1.5 rounded-md transition-all ${viewMode === 'raw' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Źródło XML
                            </button>
                        </div>
                        <button
                            onClick={resetViewer}
                            className="text-sm px-4 py-2 border border-slate-200 rounded-md hover:bg-slate-50 text-slate-600"
                        >
                            Wgraj inny plik
                        </button>
                    </div>
                )}

                {/* Logo on the right */}
                <div className="ml-4 flex items-center">
                    <img src={logoImg} alt="CzytajKSEF.pl" className="h-10 opacity-90 hover:opacity-100 transition-opacity" />
                </div>
            </header>

            <main className="flex-1 w-full">
                {viewMode === 'upload' ? (
                    /* Upload State */
                    <div className="max-w-4xl mx-auto p-8">
                        <div
                            className={`
                                mt-10 border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer
                                flex flex-col items-center justify-center gap-4 min-h-[400px]
                                ${isDragging
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-slate-300 hover:border-slate-400 hover:bg-slate-100/50'
                                }
                            `}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById('file-input')?.click()}
                        >
                            <input
                                type="file"
                                id="file-input"
                                className="hidden"
                                accept=".xml"
                                onChange={handleFileSelect}
                            />

                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                </svg>
                            </div>

                            <h2 className="text-2xl font-semibold text-slate-700">Wgraj plik KSeF</h2>
                            <p className="text-slate-500 text-lg">Przeciągnij i upuść plik XML tutaj lub kliknij, aby wybrać.</p>

                            <button
                                onClick={(e) => { e.stopPropagation(); loadDemo(); }}
                                className="mt-4 px-4 py-2 bg-white border border-slate-200 text-blue-600 rounded-lg hover:bg-blue-50 text-sm font-medium transition-colors"
                            >
                                Załaduj przykładową fakturę (Demo)
                            </button>

                            {error && (
                                <div className="mt-6 p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100 flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
                                    </svg>
                                    {error}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    /* Viewer State */
                    <div className="bg-slate-100/50 min-h-full">
                        {viewMode === 'view' && invoiceData && (
                            <InvoicePreview data={invoiceData} />
                        )}

                        {viewMode === 'raw' && (
                            <div className="max-w-7xl mx-auto p-8">
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="p-0 overflow-auto max-h-[calc(100vh-200px)]">
                                        <pre className="p-4 text-xs font-mono text-slate-600 leading-relaxed whitespace-pre-wrap">
                                            {rawXml}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;
