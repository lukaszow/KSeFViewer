# KSeF Viewer

Minimal, **privacy-first** React application for viewing Polish KSeF (Krajowy System e-Faktur) XML invoices. Designed with a **Zero-Knowledge** architecture.

## 📖 Documentation

- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Guidelines for developers and **AI Session Bootstrap Prompt**.
- **[AI_RULES.md](AI_RULES.md)** - Technology stack and coding standards.
- **[STRUCTURE.md](STRUCTURE.md)** - Project architecture and directory tree.


## Security & Privacy (Zero-Knowledge)

This application is built to ensure maximum data privacy:
- **Local Processing:** All XML parsing and data extraction happen entirely in your browser.
- **No Server-Side:** Your invoice data never leaves your computer. We do not have a backend that stores or logs your files.
- **Open Source:** The code is [transparent and open source](https://github.com/lukaszow/KSeFViewer) for Anyone to audit.

### Input Validation & File Safety

- **Extension + MIME type check:** Only files with `.xml` extension and `application/xml` / `text/xml` MIME type are accepted.
- **File size limit:** Files larger than 10 MB are rejected before reading.

### XML Parser Hardening

- **Entity processing disabled** (`processEntities: false`): prevents XXE (XML External Entity) injection and XML-bomb / billion-laughs attacks.
- **Size guard:** XML content exceeding 10 MB is rejected before parsing.

### HTTP Security Headers

The following headers are set via `<meta>` tags in `index.html`:

- **Content-Security-Policy:** restricts script, style, and resource origins to `'self'`, blocking injected scripts.
- **X-Content-Type-Options: nosniff** — prevents MIME-type sniffing attacks.
- **X-Frame-Options: DENY** — prevents clickjacking by disallowing iframe embedding.

## Technology Stack

### Core Framework

- **React**: 19.2.4 - UI framework
- **TypeScript**: 5.9.3 - Type-safe JavaScript
- **Vite**: 8.0.1 - Build tool and development server

### Styling

- **Tailwind CSS**: 4.2.2 - Utility-first CSS framework (Vite plugin, no PostCSS required)
- **tailwind-merge**: 3.5.0 - Utility class merging
- **clsx**: 2.1.0 - Conditional className utility

### XML Processing

- **fast-xml-parser**: 5.5.8 - XML parsing and validation

### Code Quality

- **ESLint**: 9.39.4 - Code linting (flat config)
- **typescript-eslint**: 8.57.1 - TypeScript linting rules and parser
- **eslint-plugin-react-hooks**: 5.2.0 - React hooks linting
- **eslint-plugin-react-refresh**: 0.5.2 - React refresh linting

### Testing

- **Vitest**: 4.1.0 - Unit testing framework
- **jsdom**: 29.0.1 - DOM environment for testing

### Type Definitions

- **@types/react**: 19.2.14 - React type definitions
- **@types/react-dom**: 19.2.3 - React DOM type definitions
- **@types/node**: 25.5.0 - Node.js type definitions

## Development Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation
```bash
npm install
```

### Available Scripts
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Preview production build
npm run preview
```

### TypeScript Configuration
- **Target**: ES2020
- **Module**: ESNext
- **Strict mode**: Enabled
- **JSX**: react-jsx transform
- **Unused variables/parameters**: Checked

## Project Structure

```
src/
├── assets/             # Static assets (logos, etc.)
├── components/         # React components
│   ├── ui/             # Reusable UI components
│   │   └── SecurityInfo.tsx
│   └── InvoicePreview.tsx # Main invoice visualization
├── utils/              # Utility functions
│   ├── xmlParser.ts    # XML to JSON conversion logic
│   └── __tests__/      # Unit tests
├── App.tsx             # Main application layout and state
├── main.tsx            # Application entry point
└── index.css           # Global Tailwind styles
```

## Build & Deployment

### Build Configuration
- **Build tool**: Vite
- **Output directory**: `dist/` (custom configuration)
- **Type checking**: Enabled via `tsc && vite build`
- **Asset optimization**: Automatic

### Deployment
The application builds to static files in the `dist/` directory, suitable for deployment to any static hosting service.