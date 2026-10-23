# Contributing to KSeF Viewer

Thanks for your interest in contributing! This project is MIT-licensed and welcomes
contributors of all experience levels.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Security](#security)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

Be respectful, constructive, and inclusive. Harassment or abusive behavior is not tolerated.

## How to Contribute

- **Report bugs** — open an issue with steps to reproduce, expected vs. actual behavior, and
  a minimal example file if possible.
- **Suggest features** — open an issue describing the use case.
- **Write code** — pick an open issue or propose a change first so we can align on the approach.

## Development Setup

Prerequisites: **Node.js 22+** (see [`.nvmrc`](.nvmrc)).

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev

# Type-check and build
npm run build

# Lint (fails on any warning)
npm run lint

# Run the test suite
npm run test

# Serve the production build
npm run preview
```

## Coding Standards

1. **Language** — identifiers, functions, and comments in code: **English**. User-facing UI
   strings: **Polish**.
2. **Type safety** — TypeScript strict mode is enabled. Keep the codebase free of dead code;
   the build fails on unused locals and parameters.
3. **Safety** — always guard XML node access with optional chaining (`?.`).
4. **Performance** — use `useMemo` for heavy XML parsing operations; avoid unnecessary re-renders.
5. **Types** — `src/core/types/ksef.types.ts` mirrors the raw KSeF FA(3) schema;
   `src/core/types/invoice.types.ts` is the view model used by components. The mapper
   (`src/features/viewer/utils/invoiceMapper.ts`) is the only layer that interprets `P_*` fields.
   See [`DOCS_KSEF_SCHEMA.md`](DOCS_KSEF_SCHEMA.md).

## Security

This project is a zero-knowledge tool — the codebase must never send user data anywhere.

- Keep entity processing disabled in the XML parser (`processEntities: false`) — this prevents
  XXE and XML-bomb attacks.
- Keep `parseTagValue: false` so identifiers (NIP, bank accounts, invoice numbers) are not coerced
  to numbers.
- The production CSP is injected in `vite.config.ts` and mirrored in `public/.htaccess`; do not add
  external scripts, fonts, styles or `fetch` calls (`connect-src 'none'`).
- `X-Frame-Options` and `X-Content-Type-Options` are sent as HTTP headers by `.htaccess` (they are
  ignored in `<meta>`); keep them configured if you change hosting.

When reporting a security issue, **do not** open a public issue. Email the maintainer directly
or use GitHub's private vulnerability reporting.

## Pull Request Process

1. Fork the repository and create a feature branch from `main`.
2. Make your changes and ensure `npm run lint`, `npm run build` and `npm run test` pass.
3. Add tests when you add or change parsing/validation logic. `examples.test.ts` uses the official
   FA(3) invoices as fixtures — add a new file there when supporting a new schema variant.
4. Open a pull request describing the change, why it's needed, and how it was tested.
5. A maintainer will review; address review feedback and keep the PR focused.
