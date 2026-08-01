# KSeF Viewer

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)

> Minimal, **privacy-first** viewer for Polish KSeF (Krajowy System e-Faktur) XML invoices.
> Designed with a **Zero-Knowledge** architecture — your invoice data never leaves your browser.

**Polski:** Lekka aplikacja webowa do podglądu faktur KSeF w formacie XML. Całe przetwarzanie
odbywa się lokalnie w przeglądarce — dane nie są wysyłane, przetwarzane ani logowane na żadnym
serwerze.

## Features

- **Zero-Knowledge by design** — all parsing happens in-browser, no backend
- **A4-style invoice preview** — header, seller/buyer data, line items, VAT summary
- **Raw XML view** — inspect the original document alongside the rendered invoice
- **Input hardening** — extension + MIME checks, 10 MB size limit, XXE/XML-bomb protection
- **Print-ready layout** — the invoice renders cleanly on paper
- **Offline-friendly** — a static SPA that can be hosted on any static hosting service
- **Demo mode** — try the app with sample data without uploading a file

## Live Demo

Try it at **[https://czytajksef.pl](https://czytajksef.pl)** — no data leaves your browser.

## Security & Privacy

This application is built to ensure maximum data privacy:

- **Local processing** — all XML parsing and data extraction happen entirely in your browser.
- **No server-side** — your invoice data never leaves your computer. There is no backend that
  stores or logs your files.
- **Open source** — the code is transparent and open for audit under the
  [MIT license](LICENSE).

### Input validation & file safety

- **Extension + MIME type check** — only files with `.xml` extension and
  `application/xml` / `text/xml` MIME type are accepted.
- **File size limit** — files larger than 10 MB are rejected before reading.

### XML parser hardening

- **Entity processing disabled** (`processEntities: false`) — prevents XXE (XML External Entity)
  injection and XML-bomb / billion-laughs attacks.
- **Size guard** — XML content exceeding 10 MB is rejected before parsing.

### HTTP security headers

The following headers are set via `<meta>` tags in `index.html`:

- **Content-Security-Policy** — restricts script, style, and resource origins to `'self'`,
  blocking injected scripts.
- **X-Content-Type-Options: nosniff** — prevents MIME-type sniffing attacks.
- **X-Frame-Options: DENY** — prevents clickjacking by disallowing iframe embedding.

## Technology Stack

- **React** + **TypeScript** (strict mode) — UI framework
- **Vite** — build tool and dev server
- **Tailwind CSS v4** (Vite plugin) — utility-first styling
- **fast-xml-parser** — XML parsing and validation
- **ESLint** (+ typescript-eslint) — code quality

Exact versions are managed in [`package.json`](package.json).

## Getting Started

### Prerequisites

- **Node.js 22+** (see [`.nvmrc`](.nvmrc))
- npm (or your preferred Node package manager)

### Installation

```bash
npm install
```

### Available scripts

```bash
# Start development server (defaults to http://localhost:5173)
npm run dev

# Type-check and build for production
npm run build

# Run ESLint (fails on any warning)
npm run lint

# Serve the production build
npm run preview
```

## Project Structure

```
src/
├── assets/                    # Static assets
├── components/
│   └── ui/                    # Reusable, dumb UI components
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── FileDropzone.tsx
│       └── SecurityInfo.tsx
├── core/
│   ├── config/
│   │   └── demoData.ts        # Sample invoice used by demo mode
│   └── types/
│       └── ksef.types.ts      # TS interfaces mirroring the KSeF schema
├── features/
│   └── viewer/                # Invoice domain: display + parsing
│       ├── components/
│       │   ├── InvoiceHeader.tsx
│       │   ├── InvoicePaper.tsx
│       │   ├── InvoiceSummary.tsx
│       │   └── InvoiceTable.tsx
│       └── utils/
│           ├── ksefParser.ts      # XML string -> KSeFInvoice (pure function)
│           └── ksefValidators.ts  # Math/date sanity checks
├── App.tsx                    # Main layout and state
├── index.css                  # Global Tailwind styles
└── main.tsx                   # Application entry point
```

### Domain reference

- [`DOCS_KSEF_SCHEMA.md`](DOCS_KSEF_SCHEMA.md) — cheat sheet of the KSeF FA(3) logical structure.
- [`examples/`](examples/) — official sample KSeF FA(3) invoices (XML + PDF descriptions).

### AI-agent documentation

This repository includes AI-oriented docs used to keep development consistent:
[`AI_RULES.md`](AI_RULES.md), [`STRUCTURE.md`](STRUCTURE.md), and
[`DEVELOPMENT.md`](DEVELOPMENT.md).

## Testing

Vitest is configured as a dev dependency. There are no test files in the repository yet —
contributions adding parser and validator tests are very welcome.

## Deployment

A GitHub Actions workflow (`.github/workflows/deploy.yml`) deploys the production build to
`czytajksef.pl` over FTP on every push to `main`. The workflow requires the
`FTP_SERVER`, `FTP_USERNAME`, and `FTP_PASSWORD` repository secrets.

## Contributing

Contributions are welcome! Please read [`CONTRIBUTING.md`](CONTRIBUTING.md) first.

## License

[MIT](LICENSE) © 2026 [Lukasz Stilger](https://github.com/lukaszow)
