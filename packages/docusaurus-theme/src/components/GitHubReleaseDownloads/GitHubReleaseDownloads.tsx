import React, { useEffect, useState } from 'react';
import {
    DownloadSection,
    type DownloadSectionProps,
    type ExtraPlatform,
    type PlatformSpec,
} from '../DownloadCard/DownloadCard';

export type Channel =
    | 'stable'
    | 'prerelease'
    | 'any'
    | { tag: string };

export type PatternValue = RegExp | string;

export interface ArchPatternMap {
    [arch: string]: PatternValue;
}

export interface PlatformPatternMap {
    windows?: ArchPatternMap;
    macos?: ArchPatternMap;
    linux?: ArchPatternMap;
}

export interface ExtraPatternPlatform {
    osName: string;
    match: ArchPatternMap;
    logo?: string;
}

export interface GitHubReleaseDownloadsProps {
    repo: string;
    channel?: Channel;
    platforms: PlatformPatternMap;
    extras?: ExtraPatternPlatform[];
}

interface GitHubAsset {
    name: string;
    browser_download_url: string;
}

interface GitHubRelease {
    tag_name: string;
    draft: boolean;
    prerelease: boolean;
    assets: GitHubAsset[];
}

const CACHE_TTL_MS = 60 * 60 * 1000;
const CACHE_PREFIX = 'nf-gh-release-downloads:';

const channelKey = (channel: Channel): string => {
    if (typeof channel === 'string') return channel;
    return `tag:${channel.tag}`;
};

const matches = (assetName: string, pattern: PatternValue): boolean => {
    if (pattern instanceof RegExp) return pattern.test(assetName);
    return assetName.includes(pattern);
};

const resolvePlatform = (
    assets: GitHubAsset[],
    archMap: ArchPatternMap,
    logo?: string,
): PlatformSpec | undefined => {
    const links = Object.entries(archMap).flatMap(([arch, pattern]) => {
        const hit = assets.find(a => matches(a.name, pattern));
        return hit ? [{ arch, url: hit.browser_download_url }] : [];
    });
    if (links.length === 0) return undefined;
    return logo ? { links, logo } : { links };
};

const fetchRelease = async (repo: string, channel: Channel): Promise<GitHubRelease | null> => {
    const base = `https://api.github.com/repos/${repo}/releases`;

    if (typeof channel === 'object' && channel.tag) {
        const res = await fetch(`${base}/tags/${encodeURIComponent(channel.tag)}`);
        if (!res.ok) return null;
        return res.json();
    }

    if (channel === 'stable') {
        const res = await fetch(`${base}/latest`);
        if (!res.ok) return null;
        return res.json();
    }

    const res = await fetch(`${base}?per_page=30`);
    if (!res.ok) return null;
    const list = (await res.json()) as GitHubRelease[];
    if (channel === 'prerelease') {
        return list.find(r => r.prerelease && !r.draft) ?? null;
    }
    return list.find(r => !r.draft) ?? null;
};

const readCache = (key: string): DownloadSectionProps | null => {
    try {
        const raw = sessionStorage.getItem(key);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as { t: number; v: DownloadSectionProps };
        if (Date.now() - parsed.t > CACHE_TTL_MS) return null;
        return parsed.v;
    } catch {
        return null;
    }
};

const writeCache = (key: string, value: DownloadSectionProps): void => {
    try {
        sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), v: value }));
    } catch {
        // ignore quota / disabled storage
    }
};

export const GitHubReleaseDownloads: React.FC<GitHubReleaseDownloadsProps> = ({
    repo,
    channel = 'stable',
    platforms,
    extras,
}) => {
    const [resolved, setResolved] = useState<DownloadSectionProps | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const cacheKey = `${CACHE_PREFIX}${repo}:${channelKey(channel)}`;
        const cached = readCache(cacheKey);
        if (cached) {
            setResolved(cached);
            return;
        }

        let cancelled = false;
        (async () => {
            try {
                const release = await fetchRelease(repo, channel);
                if (!release || cancelled) return;

                const assets = release.assets ?? [];
                const next: DownloadSectionProps = {};

                if (platforms.windows) {
                    const spec = resolvePlatform(assets, platforms.windows);
                    if (spec) next.windows = spec;
                }
                if (platforms.macos) {
                    const spec = resolvePlatform(assets, platforms.macos);
                    if (spec) next.macos = spec;
                }
                if (platforms.linux) {
                    const spec = resolvePlatform(assets, platforms.linux);
                    if (spec) next.linux = spec;
                }
                if (extras && extras.length > 0) {
                    const resolvedExtras: ExtraPlatform[] = [];
                    for (const extra of extras) {
                        const spec = resolvePlatform(assets, extra.match, extra.logo);
                        if (spec) resolvedExtras.push({ osName: extra.osName, ...spec });
                    }
                    if (resolvedExtras.length > 0) next.extras = resolvedExtras;
                }

                writeCache(cacheKey, next);
                setResolved(next);
            } catch {
                // swallow; render null
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [repo, channelKey(channel), platforms, extras]);

    if (!resolved) return null;
    return <DownloadSection {...resolved} />;
};
