# AGENTS.md

Client-side React SPA (Vite + React 19 + TS strict + Tailwind v4 via Vite plugin) for viewing Polish KSeF XML invoices. Zero-knowledge: all parsing happens in-browser, no backend.

## Commands

- `npm run dev` - Vite dev server (defaults to `http://localhost:5173`)
- `npm run build` - `tsc && vite build`. This is the typecheck command; there is no separate `typecheck` script. Fails on any unused local/param (`noUnusedLocals`/`noUnusedParameters`) — never ship dead code.
- `npm run lint` - ESLint flat config, `--max-warnings 0`: a single warning fails lint. `react-refresh/only-export-components` is a warning here.
- `npm run preview` - serve the production build.
- No `test` script exists and there is no Vitest config. Vitest is a devDependency but there are **no test files** in the repo — don't assume a test suite.
- Requires **Node 22+** (`engines` in `package.json`, pinned in `.nvmrc`).

- No env file is needed for local dev.

## Security invariants (do not regress)

- `src/features/viewer/utils/ksefParser.ts` parses with `processEntities: false` (XXE / XML-bomb protection), `attributeNamePrefix: ''` (no `@` prefix on attributes), and `transformTagName` strips XML namespaces (`<ns:Faktura>` → `Faktura`). Root element must be `Faktura`. Keep entity processing disabled.
- `index.html` carries CSP / nosniff / X-Frame-Options meta tags. Keep them.
- Only `.xml` with `application/xml`/`text/xml` MIME, max 10 MB (enforced in both parser and `App.tsx`).

## Architecture & conventions

- Structure: `src/core/` (types, config/demoData), `src/components/ui/` (dumb components), `src/features/viewer/` (invoice display + parser/validators). Entry: `src/main.tsx` → `App.tsx`. No state library; plain React state per `STRUCTURE.md`.
- `src/core/types/ksef.types.ts` is the single source of truth for TS interfaces mirroring the KSeF schema (`DOCS_KSEF_SCHEMA.md` is the domain reference).
- **Known FA(3) schema mismatch — don't "fix" silently:** the types are not fully aligned with the real schema. `P_1`/`P_2` are swapped (types treat `P_1` as invoice number, `P_2` as issue date; in real FA(3) `P_1` is the issue date, `P_2` the invoice number), addresses only model FA(2)-style `AdresPol` while FA(3) files use `AdresL1`/`AdresL2`, and only the 23% VAT rate (`P_13_1`/`P_14_1`) is mapped. `DOCS_KSEF_SCHEMA.md` documents the real schema and lists these gaps under "Known discrepancies". Any change to the types must keep `demoData.ts`, `InvoiceHeader`, and that doc consistent.
- Style rules from `AI_RULES.md`: identifiers/comments in **English**, user-facing UI strings in **Polish**; guard XML node access with optional chaining `?.`; `useMemo` heavy parsing.
- `tsconfig.json` sets `allowImportingTsExtensions: true` — imports may use explicit `.ts`/`.tsx` extensions.
- Docs drift: `STRUCTURE.md` and `README.md` now match the real tree. The authoritative gap list lives in `DOCS_KSEF_SCHEMA.md` → "Known discrepancies" (see the schema-mismatch bullet above).
- There is no `tailwind.config` or PostCSS config; Tailwind v4 is configured in `src/index.css` via the Vite plugin.
