# AGENTS.md

Client-side React SPA (Vite + React 19 + TS strict + Tailwind v4 via Vite plugin) for viewing Polish KSeF XML invoices. Zero-knowledge: all parsing happens in-browser, no backend and no network calls.

## Commands

- `npm run dev` - Vite dev server (defaults to `http://localhost:5173`)
- `npm run build` - `tsc && vite build`. This is the typecheck command; there is no separate `typecheck` script. Fails on any unused local/param (`noUnusedLocals`/`noUnusedParameters`) — never ship dead code.
- `npm run lint` - ESLint flat config, `--max-warnings 0`: a single warning fails lint. `react-refresh/only-export-components` is a warning here.
- `npm run test` - Vitest (`vitest.config.ts`, node environment). Test files are colocated as `src/**/*.test.ts`; the 26 official invoices in `examples/` are used as fixtures by `examples.test.ts`.
- `npm run preview` - serve the production build.
- Requires **Node 22+** (`engines` in `package.json`, pinned in `.nvmrc`). No env file is needed for local dev.

## Security invariants (do not regress)

- `src/features/viewer/utils/ksefParser.ts` parses with `processEntities: false` (XXE / XML-bomb protection), `attributeNamePrefix: ''` (no `@` prefix on attributes), and `transformTagName` strips XML namespaces (`<ns:Faktura>` → `Faktura`). Root element must be `Faktura`.
- **Keep `parseTagValue: false`.** Automatic numeric coercion corrupts identifiers (NIP with a leading zero, bank account numbers, numeric invoice numbers). Numeric fields are converted explicitly in `invoiceMapper.ts`.
- Only `.xml` with `application/xml`/`text/xml` MIME, max 10 MB (enforced in `core/utils/fileValidation.ts` and again in the parser via `TextEncoder`).
- The production build injects a strict CSP meta tag (`injectCsp` in `vite.config.ts`); `public/.htaccess` sends CSP, `X-Frame-Options`, `X-Content-Type-Options` and `Referrer-Policy` as real HTTP headers (these two headers are ignored in `<meta>`). Keep both in sync when changing the policy.
- No network requests: `connect-src 'none'`. The version badge reads build-time values only. Do not add fetches or external assets.

## Architecture & conventions

- Structure: `src/core/` (schema types, view-model types, config, utils), `src/components/ui/` (dumb components), `src/features/viewer/` (display + parser/mapper/validators). Entry: `src/main.tsx` → `App.tsx`. No state library; plain React state per `STRUCTURE.md`.
- Two type layers, keep them separate:
  - `src/core/types/ksef.types.ts` — raw FA(3) XML structure (`P_*` fields, all optional, all values strings). Single source of truth for the schema.
  - `src/core/types/invoice.types.ts` — `Invoice` view model consumed by components.
- Data flow: `parseKsefXml` (raw XML → typed `RawParseResult`) → `mapToInvoice` (FA(3) → `Invoice`) → components. UI components must not read raw `P_*` fields.
- Parsing runs in `parseInvoice.worker.ts` via `parseInvoice()`; `parseInvoiceSync()` is the fallback and is what tests use.
- FA(3) mapping rules already implemented: `P_1` = issue date, `P_2` = invoice number, `Fa/KodWaluty` = currency, addresses from `AdresL1`/`AdresL2` (with FA(2) `AdresPol` fallback), VAT summary aggregated from every `P_13_*` field with its exact `P_14_*` counterpart (ignore `P_14_*W`, which is VAT in PLN for foreign-currency invoices), annotations from `1/2` codes, `Rozliczenie/DoZaplaty` overrides the amount due.
- `demoData.ts` exports `DEMO_XML`, which goes through the same parse/map pipeline as user files — keep it valid FA(3).
- Validation warnings (`validateInvoice`) are informational and must not false-positive on corrections (`KOR*`), advance/settlement invoices (`ZAL`, `ROZ`) or foreign-currency invoices. `examples.test.ts` asserts zero warnings for all reference files.
- Style rules from `AI_RULES.md`: identifiers/comments in **English**, user-facing UI strings in **Polish**; guard XML node access with optional chaining `?.`; `useMemo` heavy work.
- `tsconfig.json` sets `allowImportingTsExtensions: true` — imports may use explicit `.ts`/`.tsx` extensions.
- There is no `tailwind.config` or PostCSS config; Tailwind v4 is configured in `src/index.css` via the Vite plugin. Do not use class names that Tailwind does not generate (e.g. `animate-in`, `letter-tracking-widest`).
