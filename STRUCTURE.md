# PROJECT STRUCTURE & ARCHITECTURE

This document describes the actual directory layout of the repository. When adding new
top-level folders, discuss it first.

## ROOT DIRECTORY

- `LICENSE` - MIT license.
- `README.md` - Project overview and usage.
- `CONTRIBUTING.md` - Contribution guidelines.
- `AI_RULES.md` - AI agent coding standards (tech stack, language rules).
- `DEVELOPMENT.md` - AI session bootstrap prompt and project governance notes.
- `DOCS_KSEF_SCHEMA.md` - Knowledge base about the KSeF FA(3) XML structure.
- `STRUCTURE.md` - This file.
- `examples/` - Official KSeF FA(3) sample invoices (XML + PDF), also used as test fixtures.
- `public/` - Static files copied to `dist/`: `favicon.svg` and `.htaccess` (security/caching headers).
- `.github/workflows/` - CI (`ci.yml`) and deployment (`deploy.yml`) pipelines.
- `package.json` - Dependencies and scripts.
- `vite.config.ts` - Build configuration and production CSP injection.
- `vitest.config.ts` - Test runner configuration.
- `.nvmrc` - Pinned Node.js version (22).

## SOURCE CODE (`/src`)

### 1. Core (`/src/core`)
Global, app-wide logic.
- `/types` - Global TypeScript definitions.
    - `ksef.types.ts` - Raw FA(3) XML interfaces mirroring the KSeF schema (all fields optional, string values).
    - `invoice.types.ts` - `Invoice` view model consumed by UI components.
- `/config` - Constants and static data.
    - `demoData.ts` - Sample FA(3) XML used by demo mode (parsed through the real pipeline).
- `/utils` - Small shared helpers.
    - `cn.ts` - `clsx` + `tailwind-merge` class helper.
    - `fileValidation.ts` - Extension, MIME type and size checks.
    - `format.ts` - Amount, quantity and date formatting.

### 2. Shared UI (`/src/components/ui`)
Generic, reusable visual components (dumb components).
- `AppVersion.tsx` - Build-time version badge (no network calls).
- `Button.tsx`
- `Card.tsx`
- `ErrorBoundary.tsx` - Catches unexpected render errors.
- `FileDropzone.tsx` - Accessible upload area, no business logic.
- `SecurityInfo.tsx` - Privacy/security trust section.

### 3. Features (`/src/features`)
Domain-specific logic, grouped by business domain.

#### Invoice Viewer (`/src/features/viewer`)
Logic related to displaying and processing the invoice.
- `/components`
    - `InvoicePaper.tsx` - The A4 visualization container + validation warnings.
    - `InvoiceHeader.tsx` - Invoice title, dates, seller/buyer data.
    - `InvoiceTable.tsx` - Line items grid.
    - `InvoiceSummary.tsx` - Multi-rate VAT summary and totals.
- `/utils`
    - `ksefParser.ts` - Pure XML -> raw FA(3) parser with typed error codes.
    - `invoiceMapper.ts` - Raw FA(3) -> `Invoice` view model (dates, addresses, VAT rates, annotations).
    - `parseInvoice.ts` - Worker-backed parsing API with synchronous fallback.
    - `parseInvoice.worker.ts` - Web Worker entry point.
    - `parseResult.ts` - Parse result types.
    - `ksefValidators.ts` - Informational net/gross/date checks.
    - `*.test.ts` - Vitest suites (including all files from `examples/`).

### 4. Application Entry (`/src`)
- `App.tsx` - Main layout composition and state.
- `main.tsx` - React DOM entry point (wraps `App` in `ErrorBoundary`).
- `index.css` - Global Tailwind and print styles.

## DATA FLOW GUIDELINES
1.  **Parsing:** `App.tsx` reads the file text and calls `parseInvoice()`. The worker runs
    `parseKsefXml` (raw FA(3)) followed by `mapToInvoice` (view model); `parseInvoiceSync` is the
    fallback used in tests.
2.  **State:** the loaded document (`fileName`, `rawXml`, `invoice`) is passed down to
    `InvoicePaper`; UI components never read raw `P_*` fields.
3.  **No Redux/Zustand** needed for MVP. Use simple React State.
