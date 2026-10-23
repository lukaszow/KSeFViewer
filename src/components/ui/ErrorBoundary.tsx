import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryProps {
    children: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState = { hasError: false };

    static getDerivedStateFromError(): ErrorBoundaryState {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('Unhandled UI error:', error, info.componentStack);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-50 p-8">
                    <div
                        role="alert"
                        className="max-w-md text-center bg-white border border-red-100 rounded-2xl p-8 shadow-sm"
                    >
                        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-4" aria-hidden="true" />
                        <h1 className="text-lg font-bold text-slate-900 mb-2">
                            Wystąpił nieoczekiwany błąd
                        </h1>
                        <p className="text-sm text-slate-600 mb-6">
                            Odśwież stronę i spróbuj ponownie. Jeśli problem się powtarza, zgłoś go
                            w repozytorium projektu.
                        </p>
                        <button
                            type="button"
                            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                            onClick={() => window.location.reload()}
                        >
                            Odśwież stronę
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
