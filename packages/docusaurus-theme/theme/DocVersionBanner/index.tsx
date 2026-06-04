import React, { type ReactNode } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useLocation } from 'react-router-dom';
import type { ThemeConfigWithNetFoundry } from '../../src/options';

type Props = { className?: string };

/**
 * Path-aware version banner override.
 *
 * Renders the first matching entry from themeConfig.netfoundry.versionBanners
 * whose pathPrefix matches the current page URL. If no entry matches, renders
 * nothing — configure a versionBanners entry for every versioned path that
 * should display a banner.
 */
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
            {match.message}
        </div>
    );
}
