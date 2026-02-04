# KSeF FA(2) LOGICAL STRUCTURE CHEATSHEET

Use this mapping to interpret parsed XML data. Do not hallucinate field names.

## XML ROOT
Path: `Faktura` (Namespace usually contains `/wzor/2023/`)

## KEY SECTIONS

### 1. Header (Nagłówek) - Path: `Faktura.Naglowek`
- `KodWaluty`: Currency (e.g., PLN)
- `DataWytworzeniaFa`: Generation Date

### 2. Seller (Sprzedawca) - Path: `Faktura.Podmiot1`
- `DaneIdentyfikacyjne.NIP`: Tax ID
- `DaneIdentyfikacyjne.Nazwa`: Company Name
- `Adres.AdresPol`: Address details

### 3. Buyer (Nabywca) - Path: `Faktura.Podmiot2`
- Similar structure to Seller.

### 4. Invoice Body (Treść) - Path: `Faktura.Fa`
**Important:** KSeF uses codes (P_...) referencing old VAT-7 declaration fields.

| XML Field | Human Meaning | Type |
| :--- | :--- | :--- |
| `P_1` | Invoice Number | String |
| `P_2` | Issue Date (Data Wystawienia) | Date (YYYY-MM-DD) |
| `P_6` | Sale Date (Data Sprzedaży) | Date |
| `P_13_1` | Net Amount (Sum) for 23% VAT | Decimal |
| `P_14_1` | VAT Amount (Sum) for 23% VAT | Decimal |
| `P_15` | **Total Gross Amount (Do Zapłaty)** | Decimal |
| `Adnotacje.P_16` | "Cash Accounting" method (Metoda Kasowa) | Boolean (1/0) |
| `Adnotacje.P_18` | Split Payment Mechanism (MPP) | Boolean (1/0) |

### 5. Line Items (Wiersze) - Path: `Faktura.Fa.FaWiersz`
This is an Array of items.
- `NrWierszaFa`: Ordinal Number
- `P_7`: Item Name (Nazwa towaru/usługi)
- `P_9A`: Unit Price Net (Cena jedn. netto)
- `P_11`: Total Net Value (Wartość netto wiersza)
- `P_12`: VAT Rate (Stawka VAT, np. "23", "zw")