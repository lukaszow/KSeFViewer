# KSeF Viewer

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)

> Minimal, **privacy-first** viewer for Polish KSeF (Krajowy System e-Faktur) XML invoices.
> Designed with a **Zero-Knowledge** architecture — your invoice data never leaves your browser.

**Polski:** Lekka aplikacja webowa do podglądu faktur KSeF w formacie XML. Całe przetwarzanie
odbywa się lokalnie w przeglądarce — dane nie są wysyłane, przetwarzane ani logowane na żadnym
serwerze.

## Features

- **Zero-Knowledge by design** — all parsing happens in-browser, no backend and no network requests
- **KSeF FA(3) support** — correct issue date / invoice number mapping, `AdresL1`/`AdresL2` addresses, annotations, invoice types and settlement amounts
- **A4-style invoice preview** — header, seller/buyer data, line items with quantities, multi-rate VAT summary
- **Raw XML view** — inspect the original document alongside the rendered invoice
- **Sanity warnings** — net/gross/date inconsistencies are surfaced instead of being silently ignored
- **Input hardening** — extension + MIME checks, 10 MB size limit, XXE/XML-bomb protection
- **Non-blocking parsing** — XML is parsed in a Web Worker, so the UI stays responsive
- **Print-ready layout** — the invoice renders cleanly on paper
- **Offline-friendly** — a static SPA that can be hosted on any static hosting service
- **Demo mode** — try the app with a sample FA(3) invoice without uploading a file

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
- **No automatic type coercion** (`parseTagValue: false`) — identifiers such as NIP, bank account
  numbers and numeric invoice numbers keep their leading zeros.
- **Size guard** — XML content exceeding 10 MB is rejected before parsing.

### HTTP security headers

The production HTML build embeds a strict `Content-Security-Policy` (`connect-src 'none'`, no
inline scripts). Real HTTP headers are configured in [`public/.htaccess`](public/.htaccess) and
deployed with the build:

- **Content-Security-Policy** — restricts scripts/styles/resources to `'self'`, blocks framing
  (`frame-ancestors 'none'`) and any network connection.
- **X-Content-Type-Options: nosniff** — prevents MIME-type sniffing attacks.
- **X-Frame-Options: DENY** — prevents clickjacking by disallowing iframe embedding.
- **Referrer-Policy** and **Permissions-Policy** — limit referrer leakage and browser features.

> `X-Frame-Options` and `X-Content-Type-Options` are ignored when set via `<meta>`; they are sent
> as HTTP headers by `.htaccess` (Apache hosting). If you deploy elsewhere, configure the same
> headers at the CDN/host level.

## Technology Stack

- **React** + **TypeScript** (strict mode) — UI framework
- **Vite** — build tool and dev server
- **Tailwind CSS v4** (Vite plugin) — utility-first styling
- **fast-xml-parser** — XML parsing and validation
- **ESLint** (+ typescript-eslint) — code quality
- **Vitest** — unit and fixture tests

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

# Run the Vitest suite
npm run test

# Serve the production build
npm run preview
```

## Project Structure

```
src/
├── components/
│   └── ui/                    # Reusable, dumb UI components
│       ├── AppVersion.tsx
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── ErrorBoundary.tsx
│       ├── FileDropzone.tsx
│       └── SecurityInfo.tsx
├── core/
│   ├── config/
│   │   └── demoData.ts        # Sample FA(3) XML used by demo mode
│   ├── types/
│   │   ├── ksef.types.ts      # Raw FA(3) schema interfaces
│   │   └── invoice.types.ts   # View model consumed by the UI
│   └── utils/
│       ├── cn.ts              # clsx + tailwind-merge helper
│       ├── fileValidation.ts  # Extension/MIME/size checks
│       └── format.ts          # Amount/quantity/date formatting
├── features/
│   └── viewer/                # Invoice domain: display + parsing
│       ├── components/
│       │   ├── InvoiceHeader.tsx
│       │   ├── InvoicePaper.tsx
│       │   ├── InvoiceSummary.tsx
│       │   └── InvoiceTable.tsx
│       └── utils/
│           ├── ksefParser.ts             # XML -> raw FA(3) structure
│           ├── invoiceMapper.ts          # raw FA(3) -> Invoice view model
│           ├── parseInvoice.ts           # Worker-backed parsing API
│           ├── parseInvoice.worker.ts    # Off-main-thread worker
│           ├── parseResult.ts            # Parse result types
│           ├── ksefValidators.ts         # Net/gross/date sanity checks
│           └── *.test.ts                 # Vitest suites
├── App.tsx                    # Main layout and state
├── index.css                  # Global Tailwind styles
└── main.tsx                   # Application entry point
```

### Domain reference

- [`DOCS_KSEF_SCHEMA.md`](DOCS_KSEF_SCHEMA.md) — cheat sheet of the KSeF FA(3) logical structure,
  including how the viewer maps it.
- [`examples/`](examples/) — official sample KSeF FA(3) invoices (XML + PDF descriptions), also used
  as test fixtures.

### AI-agent documentation

This repository includes AI-oriented docs used to keep development consistent:
[`AI_RULES.md`](AI_RULES.md), [`STRUCTURE.md`](STRUCTURE.md), and
[`DEVELOPMENT.md`](DEVELOPMENT.md).

## Testing

```bash
npm run test
```

The suite uses Vitest and covers the parser, the FA(3) → view-model mapper, validators and file
validation. `examples.test.ts` runs all 26 official FA(3) invoices from [`examples/`](examples/)
through the real pipeline and checks dates, invoice numbers, currency, addresses, VAT breakdown,
totals and validation warnings.

## Deployment

A GitHub Actions workflow (`.github/workflows/deploy.yml`) runs lint and tests first, then builds
and deploys the production output to `czytajksef.pl` on every push to `main`. The workflow requires
the `FTP_SERVER`, `FTP_USERNAME`, and `FTP_PASSWORD` repository secrets.

Deployment uses **FTPS** by default. If your host does not support TLS, set the repository variable
`FTP_PROTOCOL` to `ftp` (not recommended). [`public/.htaccess`](public/.htaccess) is deployed with
the build and supplies the security and caching headers.

Pull requests run the same lint/build/test checks via `.github/workflows/ci.yml`.

## Contributing

Contributions are welcome! Please read [`CONTRIBUTING.md`](CONTRIBUTING.md) first.

## License

[MIT](LICENSE) © 2026 [Lukasz Stilger](https://github.com/lukaszow)
