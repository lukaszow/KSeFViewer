import { useEffect, useState } from 'react';

interface GitHubRelease {
    name?: string | null;
    tag_name?: string;
}

const RELEASES_URL = 'https://api.github.com/repos/lukaszow/KSeFViewer/releases/latest';

/**
 * Fetches the latest release name from the GitHub API.
 * Falls back to the build-time version on failure (offline, private repo, rate limit).
 */
const useLatestRelease = (): string | null => {
    const [releaseName, setReleaseName] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        fetch(RELEASES_URL)
            .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
            .then((data: GitHubRelease) => {
                if (!cancelled) {
                    setReleaseName(data.name ?? data.tag_name ?? null);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setReleaseName(null);
                }
            });

        return () => {
            cancelled = true;
        };
    }, []);

    return releaseName;
};

/**
 * Tiny version badge pinned to the bottom-right corner.
 * Displays the latest release name (GitHub API) and the CI build number.
 */
const AppVersion = () => {
    const releaseName = useLatestRelease();
    const buildVersion = import.meta.env.VITE_APP_VERSION ?? '0.0.0';
    const buildNumber = import.meta.env.VITE_BUILD_NUMBER ?? 'dev';

    return (
        <div className="fixed bottom-2 right-3 z-40 text-[10px] font-medium text-slate-400 print:hidden">
            {releaseName ?? buildVersion} · build #{buildNumber}
        </div>
    );
};

export default AppVersion;
