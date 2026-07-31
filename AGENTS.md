# AGENTS.md

Client-side React SPA (Vite + React 19 + TS strict + Tailwind v4 via Vite plugin) for viewing Polish KSeF XML invoices. Zero-knowledge: all parsing happens in-browser, no backend.

## Commands

- `npm run dev` - Vite dev server (defaults to `http://localhost:5173`)
- `npm run build` - `tsc && vite build`. This is the typecheck command; there is no separate `typecheck` script. Fails on any unused local/param (`noUnusedLocals`/`noUnusedParameters`) — never ship dead code.
- `npm run lint` - ESLint flat config, `--max-warnings 0`: a single warning fails lint. `react-refresh/only-export-components` is a warning here.
- `npm run preview` - serve the production build.
- `npm run deploy` - `node deploy.cjs` (see Env/Deploy below).
- No `test` script exists. Vitest is a devDependency but there are **no test files** in the repo; README/STRUCTURE.md claims a `src/utils/__tests__` dir that doesn't exist. Don't assume a test suite.

## Env / Deploy gotchas

- `deploy.cjs` reads `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_PASS`, `DEPLOY_REMOTE_PATH`, but `.env.example` documents `SFTP_*` names. The script will not pick up the documented vars. Deploy also hardcodes SFTP port `10022` and defaults remote path to `/public_html`; target is czytajksef.pl.
- Local dev needs no env file.

## Security invariants (do not regress)

- `src/features/viewer/utils/ksefParser.ts` parses with `processEntities: false` (XXE / XML-bomb protection), `attributeNamePrefix: ''` (no `@` prefix on attributes), and `transformTagName` strips XML namespaces (`<ns:Faktura>` → `Faktura`). Root element must be `Faktura`. Keep entity processing disabled.
- `index.html` carries CSP / nosniff / X-Frame-Options meta tags. Keep them.
- Only `.xml` with `application/xml`/`text/xml` MIME, max 10 MB (enforced in both parser and `App.tsx`).

## Architecture & conventions

- Structure: `src/core/` (types, config/demoData), `src/components/ui/` (dumb components), `src/features/viewer/` (invoice display + parser/validators). Entry: `src/main.tsx` → `App.tsx`. No state library; plain React state per `STRUCTURE.md`.
- `src/core/types/ksef.types.ts` is the single source of truth for TS interfaces mirroring the KSeF schema (`DOCS_KSEF_SCHEMA.md` is the domain reference).
- Style rules from `AI_RULES.md`: identifiers/comments in **English**, user-facing UI strings in **Polish**; guard XML node access with optional chaining `?.`; `useMemo` heavy parsing.
- `tsconfig.json` sets `allowImportingTsExtensions: true` — imports may use explicit `.ts`/`.tsx` extensions.
- Docs drift: `STRUCTURE.md` describes an aspirational layout (e.g. `useKsefParser` hook) not present in code. Trust the actual `src/` tree and `package.json` over those docs.
- There is no `tailwind.config` or PostCSS config; Tailwind v4 is configured in `src/index.css` via the Vite plugin.
