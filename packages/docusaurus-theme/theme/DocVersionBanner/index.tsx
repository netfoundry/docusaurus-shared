import React, { type ReactNode } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useLocation } from 'react-router-dom';
import { useActiveDocContext, useActivePlugin } from '@docusaurus/plugin-content-docs/client';
import type { ThemeConfigWithNetFoundry, VersionBannerConfig, VersionBannerLink } from '../../src/options';

type Props = { className?: string };

function renderMessage(message: string, links?: VersionBannerLink[]): ReactNode {
    if (!links?.length) return message;
    let parts: (string | ReactNode)[] = [message];
    for (const link of links) {
        const next: (string | ReactNode)[] = [];
        for (const part of parts) {
            if (typeof part !== 'string') { next.push(part); continue; }
            const idx = part.indexOf(link.text);
            if (idx === -1) { next.push(part); continue; }
            if (idx > 0) next.push(part.slice(0, idx));
            next.push(<a key={link.text} href={link.href}>{link.text}</a>);
            const after = part.slice(idx + link.text.length);
            if (after) next.push(after);
        }
        parts = next;
    }
    return <>{parts}</>;
}

function renderBanner(match: VersionBannerConfig, className: string | undefined, links: VersionBannerLink[]): ReactNode {
    const alertType = match.type === 'info' ? 'info' : match.type === 'note' ? 'secondary' : 'warning';
    return (
        <div
            className={['alert', `alert--${alertType}`, 'margin-bottom--md', className].filter(Boolean).join(' ')}
            role="alert"
        >
            {renderMessage(match.message, links)}
        </div>
    );
}

/**
 * Rendered only when match.versionLink is set. Isolates the plugin-content-docs
 * hooks so they are always called unconditionally within this component.
 */
function BannerWithVersionLink({ match, className }: { match: VersionBannerConfig; className?: string }): ReactNode {
    const activePlugin = useActivePlugin();
    const activeDocContext = useActiveDocContext(activePlugin?.pluginId ?? 'default');
    const currentDoc = activeDocContext?.alternateDocVersions?.['current'];
    const href = currentDoc?.path ?? match.versionLink!.fallbackHref;
    const links: VersionBannerLink[] = [
        ...(match.links ?? []),
        { text: match.versionLink!.text, href },
    ];
    return renderBanner(match, className, links);
}

export default function DocVersionBanner({ className }: Props): ReactNode {
    const { siteConfig } = useDocusaurusContext();
    const { pathname } = useLocation();
    const themeConfig = siteConfig.themeConfig as ThemeConfigWithNetFoundry;
    const versionBanners = themeConfig.netfoundry?.versionBanners;
    const match = versionBanners?.find(b => pathname.startsWith(b.pathPrefix));
    if (!match) return null;
    if (match.versionLink) {
        return <BannerWithVersionLink match={match} className={className} />;
    }
    return renderBanner(match, className, match.links ?? []);
}
