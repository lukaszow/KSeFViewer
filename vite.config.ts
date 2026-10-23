import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import pkg from './package.json' with { type: 'json' }

/**
 * Injects a strict Content-Security-Policy into the production HTML only.
 * Vite's dev server relies on inline scripts (React refresh preamble), so the
 * policy is applied at build time and by the HTTP headers in `public/.htaccess`.
 */
const injectCsp = {
    name: 'inject-csp',
    apply: 'build' as const,
    transformIndexHtml(html: string) {
        const csp = [
            "default-src 'self'",
            "script-src 'self'",
            "style-src 'self'",
            "img-src 'self' data:",
            "font-src 'self'",
            "connect-src 'none'",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'none'",
        ].join('; ')

        return html.replace(
            '</head>',
            `    <meta http-equiv="Content-Security-Policy" content="${csp}" />\n</head>`,
        )
    },
}

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss(), injectCsp],
    define: {
        'import.meta.env.VITE_APP_VERSION': JSON.stringify(pkg.version),
    },
    build: {
        outDir: 'dist',
    }
})
