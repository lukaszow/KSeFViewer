import { KSeFInvoice } from '../types/ksef.types';

export const DEMO_INVOICE: KSeFInvoice = {
    Naglowek: {
        KodWaluty: 'PLN',
        DataWytworzeniaFa: new Date().toISOString(),
    },
    Podmiot1: {
        DaneIdentyfikacyjne: {
            NIP: '1234567890',
            Nazwa: 'Software House Sp. z o.o.',
        },
        Adres: {
            AdresPol: {
                KodKraju: 'PL',
                Ulica: 'Programistów',
                NrDomu: '1',
                NrLokalu: '2',
                Miejscowosc: 'Warszawa',
                KodPocztowy: '00-001',
            },
        },
    },
    Podmiot2: {
        DaneIdentyfikacyjne: {
            NIP: '9876543210',
            Nazwa: 'Jan Kowalski Services',
        },
        Adres: {
            AdresPol: {
                KodKraju: 'PL',
                Ulica: 'Klientów',
                NrDomu: '5',
                Miejscowosc: 'Wrocław',
                KodPocztowy: '02-300',
            },
        },
    },
    Fa: {
        P_1: 'FV/2024/01/001',
        P_2: '2024-01-10',
        P_6: '2024-01-10',
        P_13_1: 6000.00,
        P_14_1: 1380.00,
        P_15: 7380.00,
        Adnotacje: {
            P_16: 0,
            P_18: 0,
        },
        FaWiersz: [
            {
                NrWierszaFa: 1,
                P_7: 'Usługi programistyczne',
                P_9A: 5000.00,
                P_11: 5000.00,
                P_12: '23',
            },
            {
                NrWierszaFa: 2,
                P_7: 'Konsultacje IT',
                P_9A: 200.00,
                P_11: 1000.00,
                P_12: '23',
            },
        ],
    },
};
