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
- `examples/` - Official KSeF FA(3) sample invoices (XML + PDF).
- `.github/workflows/` - CI/CD pipelines.
- `package.json` - Dependencies and scripts.
- `vite.config.ts` - Build configuration.
- `.nvmrc` - Pinned Node.js version (22).

## SOURCE CODE (`/src`)

### 1. Core (`/src/core`)
Global, app-wide logic.
- `/types` - Global TypeScript definitions.
    - `ksef.types.ts` - Interfaces mirroring the KSeF schema (Invoice, Subject, LineItem).
- `/config` - Constants and static data.
    - `demoData.ts` - Sample invoice used by demo mode.

### 2. Shared UI (`/src/components/ui`)
Generic, reusable visual components (dumb components).
- `Button.tsx`
- `Card.tsx`
- `FileDropzone.tsx` - Visual part of upload, no business logic.
- `SecurityInfo.tsx` - Privacy/security trust section.

### 3. Features (`/src/features`)
Domain-specific logic, grouped by business domain.

#### Invoice Viewer (`/src/features/viewer`)
Logic related to displaying and processing the invoice.
- `/components`
    - `InvoicePaper.tsx` - The A4 visualization container.
    - `InvoiceHeader.tsx` - Invoice title, dates, seller/buyer data.
    - `InvoiceTable.tsx` - Line items grid.
    - `InvoiceSummary.tsx` - VAT/Totals calculation display.
- `/utils`
    - `ksefParser.ts` - The pure function transforming XML string -> JSON Object.
    - `ksefValidators.ts` - Logic to check dates and math.

### 4. Application Entry (`/src`)
- `App.tsx` - Main layout composition and state.
- `main.tsx` - React DOM entry point.
- `index.css` - Global Tailwind styles.
- `assets/` - Static assets (logos, images).

## DATA FLOW GUIDELINES
1.  **Parsing:** Occurs in `App.tsx` (see `parseKsefXml` in `ksefParser.ts`).
2.  **State:** Parsed data is passed down to `InvoicePaper` as props.
3.  **No Redux/Zustand** needed for MVP. Use simple React State.
