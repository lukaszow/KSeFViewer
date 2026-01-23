# KSeF Viewer

Minimal React application for viewing Polish KSeF (Krajowy System e-Faktur) XML invoices.

## Technology Stack

### Core Framework
- **React**: 18.2.0 - UI framework
- **TypeScript**: 5.2.0 - Type-safe JavaScript
- **Vite**: 5.0.0 - Build tool and development server

### Styling
- **Tailwind CSS**: 3.4.1 - Utility-first CSS framework
- **PostCSS**: 8.4.35 - CSS processing
- **Autoprefixer**: 10.4.17 - CSS vendor prefixing
- **tailwind-merge**: 2.2.0 - Utility class merging
- **clsx**: 2.1.0 - Conditional className utility

### XML Processing
- **fast-xml-parser**: 4.3.0 - XML parsing and validation

### Code Quality
- **ESLint**: 8.56.0 - Code linting
- **@typescript-eslint/eslint-plugin**: 6.0.0 - TypeScript linting rules
- **@typescript-eslint/parser**: 6.0.0 - TypeScript parser for ESLint
- **eslint-plugin-react-hooks**: 4.6.0 - React hooks linting
- **eslint-plugin-react-refresh**: 0.4.5 - React refresh linting

### Testing
- **Vitest**: 4.0.17 - Unit testing framework
- **jsdom**: 27.4.0 - DOM environment for testing

### Type Definitions
- **@types/react**: 18.2.0 - React type definitions
- **@types/react-dom**: 18.2.0 - React DOM type definitions
- **@types/node**: 25.0.9 - Node.js type definitions

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
├── components/          # React components
│   └── InvoiceViewer.tsx
├── utils/              # Utility functions
│   ├── xmlParser.ts
│   └── __tests__/
│       └── xmlParser.test.ts
├── assets/             # Static assets
├── App.tsx             # Main application component
├── main.tsx            # Application entry point
└── index.css           # Global styles
```

## Build & Deployment

### Build Configuration
- **Build tool**: Vite
- **Output directory**: `disc/` (custom configuration)
- **Type checking**: Enabled via `tsc && vite build`
- **Asset optimization**: Automatic

### Deployment
The application builds to static files in the `disc/` directory, suitable for deployment to any static hosting service.