const amountFormatter = new Intl.NumberFormat('pl-PL', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const quantityFormatter = new Intl.NumberFormat('pl-PL', {
    maximumFractionDigits: 3,
});

export const formatAmount = (value: number | undefined, fallback = '—'): string =>
    value === undefined ? fallback : amountFormatter.format(value);

export const formatQuantity = (value: number | undefined, fallback = '—'): string =>
    value === undefined ? fallback : quantityFormatter.format(value);

/** Formats a KSeF `YYYY-MM-DD` date as `DD.MM.YYYY`; leaves other values untouched. */
export const formatDate = (isoDate: string | undefined, fallback = '—'): string => {
    if (!isoDate) return fallback;

    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate);
    return match ? `${match[3]}.${match[2]}.${match[1]}` : isoDate;
};
