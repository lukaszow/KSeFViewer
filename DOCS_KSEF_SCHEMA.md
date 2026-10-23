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
| `P_13_2` / `P_14_2` | Net / VAT for 8% VAT | Decimal |
| `P_13_3` / `P_14_3` | Net / VAT for 5% VAT | Decimal |
| `P_13_4` | Net for 0% VAT (domestic) | Decimal |
| `P_13_5` | Net for 0% intra-EU supply (WDT) | Decimal |
| `P_13_6_1`, `P_13_6_2`, `P_13_6_3` | Net for 0% export | Decimal |
| `P_13_7` | Net for 0% outside the country | Decimal |
| `P_13_11` | Net for 0% new means of transport | Decimal |
| `P_14_1W` | VAT in PLN for a foreign-currency invoice (informational) | Decimal |
| `P_15` | Total Gross Amount (Do zapłaty) | Decimal |
| `Rozliczenie.DoZaplaty` | Final amount due when the invoice settles charges/deductions | Decimal |
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
| `P_6A` | Line sale date | Date |
| `P_7` | Item name (Nazwa towaru/usługi) | String |
| `P_8A` | Unit of measure | String |
| `P_8B` | Quantity | Decimal |
| `P_9A` / `P_9B` | Unit net price in PLN / in foreign currency | Decimal |
| `P_11` / `P_11A` | Line net total in PLN / in foreign currency | Decimal |
| `P_12` | VAT rate (e.g. `23`, `5`, `zw`, `0 WDT`, `0 EX`) | String |

### 6. Footer (Stopka) - Path: `Faktura.Stopka`
- `Informacje.StopkaFaktury` - Additional footer text.
- `Rejestry` - `KRS`, `REGON`, `BDO`.

## IMPLEMENTATION NOTES (CODE ↔ SCHEMA)

The viewer now follows the FA(3) structure above. Keep these rules in sync with the code:

1. **`P_1` / `P_2`** — `P_1` is the issue date, `P_2` is the invoice number. The mapper in
   `src/features/viewer/utils/invoiceMapper.ts` is the only place that interprets them.
2. **Addresses** — FA(3) uses `Adres.KodKraju` + `Adres.AdresL1` / `Adres.AdresL2`. The legacy
   FA(2) `Adres.AdresPol` shape is still supported as a fallback.
3. **VAT breakdown** — every `P_13_*` field is aggregated with its exact `P_14_*` counterpart
   (e.g. `P_13_6_2` → `P_14_6_2`). Fields ending in `W` (e.g. `P_14_1W`, VAT in PLN for
   foreign-currency invoices) are informational and must not be added to the invoice-currency
   summary.
4. **Annotations** — `P_16`, `P_17`, `P_18`, `P_18A` are codes: `1` means the annotation applies,
   `2` means it does not.
5. **Optional data** — simplified invoices (`RodzajFaktury = UPR`) may omit the buyer address,
   buyer name, net/VAT breakdown or line totals. All raw fields are typed as optional.
6. **Settlement** — when `Rozliczenie.DoZaplaty` is present, it is shown as the amount due, while
   `P_15` remains the gross total.
7. **Types** — raw XML interfaces live in `src/core/types/ksef.types.ts`; the UI consumes the
   `Invoice` view model from `src/core/types/invoice.types.ts`. Don't pass raw `P_*` fields to
   components.
8. **Tests** — `src/features/viewer/utils/examples.test.ts` parses and maps all reference invoices
   from `examples/`; add a new reference file there whenever a schema variant is supported.
