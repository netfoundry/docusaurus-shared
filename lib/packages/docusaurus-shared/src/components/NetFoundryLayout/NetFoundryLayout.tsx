import React, { JSX } from 'react';
import clsx from 'clsx';
import ErrorBoundary from '@docusaurus/ErrorBoundary';
import { ThemeClassNames } from '@docusaurus/theme-common';
// @ts-ignore
import { useKeyboardNavigation } from '@docusaurus/theme-common/internal';
import Head from '@docusaurus/Head';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';

import SkipToContent from '@theme/SkipToContent';
import AnnouncementBar from '@theme/AnnouncementBar';
import Navbar from '@theme/Navbar';
import LayoutProvider from '@theme/Layout/Provider';
import ErrorPageContent from '@theme/ErrorPageContent';
import styles from './NetFoundryLayout.module.css';

import { NetFoundryFooter, NetFoundryFooterProps } from '../NetFoundryFooter';
import { StarUs, StarUsProps } from '../StarUs';

export interface MetaProps {
    title?: string;
    description?: string;
    url?: string;
    image?: string;
    siteName?: string;
    locale?: string;
    twitterX?: {
        card?: 'summary' | 'summary_large_image' | 'player' | 'app';
        site?: string;
        creator?: string;
        imageAlt?: string;
    };
}

export interface NetFoundryLayoutProps {
    children: React.ReactNode;
    noFooter?: boolean;
    className?: string;
    footerClassName?: string;
    title?: string;
    description?: string;
    starProps?: StarUsProps;
    footerProps?: NetFoundryFooterProps;
    meta?: MetaProps;
}

function useAbs() {
    const { siteConfig } = useDocusaurusContext();
    return (p?: string) => {
        if (!p) return undefined;
        try { new URL(p); return p; } catch {}
        return new URL(useBaseUrl(p), siteConfig.url).toString();
    };
}

function safeMeta(meta?: MetaProps): MetaProps {
    return meta ?? {};
}

export function NetFoundryLayout({
                                     children,
                                     noFooter,
                                     className,
                                     title,
                                     description,
                                     starProps = { repoUrl: '', label: 'Star us on GitHub' },
                                     footerProps,
                                     meta: metaInput,
                                 }: NetFoundryLayoutProps): JSX.Element {
    useKeyboardNavigation();

    const abs = useAbs();
    const meta = safeMeta(metaInput);

    return (
        <LayoutProvider>
            <Head>
                <title>{(meta.title ?? title) + (meta.siteName ? ` | ${meta.siteName}` : '')}</title>
                {(meta.description ?? description) && (<meta name="description" content={meta.description ?? description} />)}
                {meta.siteName && <meta property="og:site_name" content={meta.siteName} />}
                {meta.title && <meta property="og:title" content={meta.title} />}
                {meta.description && <meta property="og:description" content={meta.description} />}
                {meta.image && <meta property="og:image" content={abs(meta.image)} />}
                <meta name="twitter:card" content={meta.twitterX?.card ?? 'summary_large_image'} />
                {meta.twitterX?.site && <meta name="twitter:site" content={meta.twitterX.site} />}
                {meta.twitterX?.creator && <meta name="twitter:creator" content={meta.twitterX.creator} />}
                {meta.image && <meta name="twitter:image" content={abs(meta.image)} />}
                {meta.twitterX?.imageAlt && <meta name="twitter:image:alt" content={meta.twitterX.imageAlt} />}
            </Head>
            <SkipToContent />
            <AnnouncementBar />
            <Navbar />
            {starProps.repoUrl && starProps.label && <StarUs {...starProps} />}
            <div
                className={clsx(
                    ThemeClassNames.wrapper.main,
                    styles.ozLayoutMainWrapper,
                    className,
                )}
            >
                <ErrorBoundary fallback={<ErrorPageContent />}>
                    {children}
                </ErrorBoundary>
                {!noFooter && footerProps && <NetFoundryFooter {...footerProps} />}
            </div>
        </LayoutProvider>
    );
}
