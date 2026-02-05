import { DragEvent, useRef, useState } from 'react';
import Card from './Card';

interface FileDropzoneProps {
    onFileSelect: (file: File) => void;
    error?: string | null;
}

const FileDropzone = ({ onFileSelect, error }: FileDropzoneProps) => {
    const [isExpanding, setIsExpanding] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsExpanding(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsExpanding(false);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsExpanding(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onFileSelect(e.dataTransfer.files[0]);
        }
    };

    return (
        <Card
            className={`
        mt-10 border-2 border-dashed rounded-2xl p-16 text-center transition-all cursor-pointer
        flex flex-col items-center justify-center gap-6 min-h-[450px]
        ${isExpanding
                    ? 'border-blue-500 bg-blue-50/50 scale-[1.01] shadow-xl shadow-blue-100'
                    : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50/50'
                }
      `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
        >
            <input
                type="file"
                ref={inputRef}
                className="hidden"
                accept=".xml"
                onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])}
            />

            <div className="w-24 h-24 bg-blue-600 text-white rounded-3xl flex items-center justify-center mb-4 rotate-3 shadow-lg shadow-blue-200">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
            </div>

            <div className="space-y-2">
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">Wgraj fakturę KSeF</h2>
                <p className="text-slate-500 text-lg font-medium">Przeciągnij i upuść plik XML lub kliknij tutaj</p>
            </div>

            {error && (
                <div className="mt-4 p-4 bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-100 flex items-center gap-3 animate-pulse">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
                        <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
                    </svg>
                    {error}
                </div>
            )}
        </Card>
    );
};

export default FileDropzone;
