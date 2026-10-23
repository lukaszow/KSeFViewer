export const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_MIME_TYPES = ['application/xml', 'text/xml'];

export interface FileMeta {
    name: string;
    type: string;
    size: number;
}

export const validateInvoiceFileMeta = ({ name, type, size }: FileMeta): string | null => {
    if (!name.toLowerCase().endsWith('.xml')) {
        return 'Proszę przesłać poprawny plik XML.';
    }
    // Some browsers/OSes report an empty MIME type for local files — only reject known-bad values.
    if (type && !ALLOWED_MIME_TYPES.includes(type)) {
        return 'Proszę przesłać poprawny plik XML.';
    }
    if (size > MAX_FILE_SIZE) {
        return 'Plik jest zbyt duży. Maksymalny rozmiar to 10 MB.';
    }
    return null;
};
