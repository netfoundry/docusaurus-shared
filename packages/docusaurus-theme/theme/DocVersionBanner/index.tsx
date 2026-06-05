import React, { type ReactNode } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useLocation } from 'react-router-dom';
import type { ThemeConfigWithNetFoundry, VersionBannerLink } from '../../src/options';

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

export default function DocVersionBanner({ className }: Props): ReactNode {
    const { siteConfig } = useDocusaurusContext();
    const { pathname } = useLocation();
    const themeConfig = siteConfig.themeConfig as ThemeConfigWithNetFoundry;
    const versionBanners = themeConfig.netfoundry?.versionBanners;
    const match = versionBanners?.find(b => pathname.startsWith(b.pathPrefix));
    if (!match) return null;
    const alertType = match.type === 'info' ? 'info' : match.type === 'note' ? 'secondary' : 'warning';
    return (
        <div
            className={['alert', `alert--${alertType}`, 'margin-bottom--md', className].filter(Boolean).join(' ')}
            role="alert"
        >
            {renderMessage(match.message, match.links)}
        </div>
    );
}
