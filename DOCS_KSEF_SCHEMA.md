# KSeF FA(3) LOGICAL STRUCTURE CHEATSHEET

Domain reference for interpreting KSeF FA(3) XML invoices (`schemat FA(3)`, namespace
`http://crd.gov.pl/wzor/2025/06/25/13775/`). Use this mapping to interpret parsed XML data.
Do not hallucinate field names. See the official examples in [`examples/`](examples/).

## XML ROOT

- Element: `Faktura`
- Root namespace: `http://crd.gov.pl/wzor/2025/06/25/13775/`
- The parser strips namespace prefixes (`transformTagName`), so `<Faktura>` keeps its name.

## KEY SECTIONS

### 1. Header (Nagłówek) - Path: `Faktura.Naglowek`
- `KodFormularza` - `kodSystemowy="FA (3)"`, `wersjaSchemy="1-0E"`.
- `WariantFormularza` - Always `3` for FA(3).
- `DataWytworzeniaFa` - Generation date (ISO 8601).
- `SystemInfo` - Software that generated the document.

### 2. Seller (Sprzedawca) - Path: `Faktura.Podmiot1`
- `DaneIdentyfikacyjne.NIP` - Tax ID.
- `DaneIdentyfikacyjne.Nazwa` - Company name.
- `Adres.KodKraju` - Country code (e.g. `PL`).
- `Adres.AdresL1` - Street address line 1.
- `Adres.AdresL2` - Postcode + city line.
- `DaneKontaktowe` - `Email`, `Telefon`.

### 3. Buyer (Nabywca) - Path: `Faktura.Podmiot2`
- Same structure as the seller, plus optional `NrKlienta`, `JST`, `GV`.

### 4. Invoice Body (Treść) - Path: `Faktura.Fa`
**Important:** KSeF uses codes (`P_...`) referencing old VAT-7 declaration fields.

| XML Field | Human Meaning | Type |
| :--- | :--- | :--- |
| `KodWaluty` | Currency (e.g. PLN) | String |
| `P_1` | Issue Date (Data wystawienia) | Date (YYYY-MM-DD) |
| `P_1M` | Place of Issue (Miejsce wystawienia) | String |
| `P_2` | Invoice Number (Numer faktury) | String |
| `P_6` | Sale Date (Data sprzedaży / dostawy) | Date |
| `P_13_1` | Net Amount for 23% VAT | Decimal |
| `P_14_1` | VAT Amount for 23% VAT | Decimal |
| `P_13_3` | Net Amount for 5% VAT | Decimal |
| `P_14_3` | VAT Amount for 5% VAT | Decimal |
| `P_15` | Total Gross Amount (Do zapłaty) | Decimal |
| `Adnotacje.P_16` | Cash accounting (Metoda kasowa) | Code (1/2) |
| `Adnotacje.P_17` | Invoice issued by buyer | Code (1/2) |
| `Adnotacje.P_18` | Split payment (MPP) | Code (1/2) |
| `Adnotacje.P_18A` | Split payment - other cases | Code (1/2) |
| `RodzajFaktury` | Invoice type (e.g. VAT) | String |
| `FP` | Fiscal printer (1/0) | Number |
| `Platnosc.Zaplacono` | Amount paid (1/0) | Number |
| `Platnosc.DataZaplaty` | Payment date | Date |
| `Platnosc.FormaPlatnosci` | Payment method code | Number |

### 5. Line Items (Wiersze) - Path: `Faktura.Fa.FaWiersz`
Array of items (repeated element):

| XML Field | Human Meaning | Type |
| :--- | :--- | :--- |
| `NrWierszaFa` | Ordinal number | Number |
| `UU_ID` | Unique line identifier | String |
| `P_7` | Item name (Nazwa towaru/usługi) | String |
| `P_8A` | Unit of measure | String |
| `P_8B` | Quantity | Decimal |
| `P_9A` | Unit net price | Decimal |
| `P_11` | Line net total | Decimal |
| `P_12` | VAT rate (e.g. `23`, `5`, `ZW`) | String |

### 6. Footer (Stopka) - Path: `Faktura.Stopka`
- `Informacje.StopkaFaktury` - Additional footer text.
- `Rejestry` - `KRS`, `REGON`, `BDO`.

## KNOWN DISCREPANCIES (CODE vs SCHEMA)

The current TypeScript types (`src/core/types/ksef.types.ts`) and the viewer do not fully match
the FA(3) schema above. Known gaps, tracked separately from this reference:

1. **`P_1` / `P_2` swapped** in `ksef.types.ts` and `demoData.ts` — the types treat `P_1` as the
   invoice number and `P_2` as the issue date, but in FA(3) `P_1` is the issue date and `P_2` is
   the invoice number.
2. **Addresses:** the types only model `Adres.AdresPol` (FA(2) style). FA(3) uses
   `Adres.AdresL1` / `Adres.AdresL2`, which real invoices will not display.
3. **VAT breakdown** is limited to the 23% rate (`P_13_1`, `P_14_1`); multi-rate invoices
   (e.g. `P_13_3` / `P_14_3`) are not aggregated.
4. **Annotations:** FA(3) uses `1/2` codes, while the types assume boolean `1/0`.
