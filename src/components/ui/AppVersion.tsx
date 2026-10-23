/**
 * Tiny version badge pinned to the bottom-right corner.
 * Reads the version injected at build time — the app makes no network requests.
 */
const AppVersion = () => {
    const version = import.meta.env.VITE_APP_VERSION ?? '0.0.0';
    const buildNumber = import.meta.env.VITE_BUILD_NUMBER ?? 'dev';

    return (
        <div className="fixed bottom-2 right-3 z-40 text-[10px] font-medium text-slate-400 print:hidden">
            v{version} · build #{buildNumber}
        </div>
    );
};

export default AppVersion;
