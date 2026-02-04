# PROJECT STRUCTURE & ARCHITECTURE

Follow this directory structure strictly. Do not create new top-level folders without permission.

## ROOT DIRECTORY
- `AI_RULES.md` - System instructions (Role, Tech Stack).
- `DOCS_KSEF_SCHEMA.md` - Knowledge base about KSeF XML fields.
- `STRUCTURE.md` - This file.
- `package.json` - Dependencies.
- `vite.config.ts` - Build configuration.

## SOURCE CODE (`/src`)

### 1. Core (`/src/core`)
Global, app-wide logic.
- `/types` - Global TypeScript definitions.
    - `ksef.types.ts` - Interfaces matching the XML schema (Invoice, Subject, LineItem).
- `/config` - Constants (e.g., max file size, allowed MIME types).

### 2. Shared UI (`/src/components/ui`)
Generic, reusable visual components (dumb components).
- `Button.tsx`
- `Card.tsx`
- `FileDropzone.tsx` - Visual part of upload, no business logic.

### 3. Features (`/src/features`)
Domain-specific logic. Group by business domain.

#### Invoice Viewer (`/src/features/viewer`)
Logic related to displaying and processing the invoice.
- `/components`
    - `InvoicePaper.tsx` - The A4 visualization container.
    - `InvoiceHeader.tsx` - Seller/Buyer data.
    - `InvoiceTable.tsx` - Line items grid.
    - `InvoiceSummary.tsx` - VAT/Totals calculation display.
- `/utils`
    - `ksefParser.ts` - The pure function transforming XML string -> JSON Object.
    - `ksefValidators.ts` - Logic to check dates and math.

### 4. Application Entry (`/src`)
- `App.tsx` - Main layout composition.
- `main.tsx` - React DOM entry point.
- `index.css` - Global Tailwind directives.

## DATA FLOW GUIDELINES
1.  **Parsing:** Occurs in `App.tsx` or a custom hook `useKsefParser`.
2.  **State:** Parsed data is passed down to `InvoicePaper` as props.
3.  **No Redux/Zustand** needed for MVP. Use simple React State.