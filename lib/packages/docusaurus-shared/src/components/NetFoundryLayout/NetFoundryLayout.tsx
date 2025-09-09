import React, { JSX } from 'react';
import clsx from 'clsx';
import ErrorBoundary from '@docusaurus/ErrorBoundary';
import { PageMetadata, ThemeClassNames } from '@docusaurus/theme-common';
// @ts-ignore
import { useKeyboardNavigation } from '@docusaurus/theme-common/internal';
import Head from '@docusaurus/Head';
import { useLocation } from '@docusaurus/router';
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
    image: string;       // path or absolute
    siteName: string;    // og:site_name
    twitter: string;     // @handle
    title: string;       // og:title override
    description: string; // og:description override
    noindex: boolean;    // robots noindex
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

const SECTION_BY_PREFIX: Array<{ prefix: string; meta: SectionMeta }> = [
    { prefix: '/openziti',  meta: { image: '/img/og/openziti.png',  siteName: 'OpenZiti Docs',  twitter: '@yourhandle' } },
    { prefix: '/frontdoor', meta: { image: '/img/og/frontdoor.png', siteName: 'Frontdoor Docs', twitter: '@yourhandle' } },
];

const DEFAULT_SECTION: SectionMeta = { image: '/img/og/default.png', siteName: 'Docs' };

function useResolvedMeta(override?: MetaInput): SectionMeta {
    const { pathname } = useLocation();
    const fromPrefix = SECTION_BY_PREFIX.find(s => pathname.startsWith(s.prefix))?.meta ?? DEFAULT_SECTION;
    return { ...fromPrefix, ...override };
}

function useAbs() {
    const { siteConfig } = useDocusaurusContext();
    return (p?: string) => {
        if (!p) return undefined;
        try { new URL(p); return p; } catch {}
        return new URL(useBaseUrl(p), siteConfig.url).toString();
    };
}

export function NetFoundryLayout(props: NetFoundryLayoutProps): JSX.Element {
    const {
        children,
        noFooter,
        className,
        title,
        description,
        starProps = { repoUrl: '', label: 'Star us on GitHub' },
    } = props;

    useKeyboardNavigation();

    const meta = useResolvedMeta(props.meta);
    const abs = useAbs();

    return (
        <LayoutProvider>
            <Head>
                <title>{meta.title ?? title}</title>
                {/*<meta name="aaa_description" content={meta.description ?? description} />*/}
                {/*{meta.noindex && <meta name="robots" content="noindex,nofollow" />}*/}
                {/*{meta.siteName && <meta property="og:site_name" content={meta.siteName} />}*/}
                {/*{meta.title && <meta property="og:title" content={meta.title} />}*/}
                {/*{meta.description && <meta property="og:description" content={meta.description} />}*/}
                {/*{meta.image && <meta property="og:image" content={abs(meta.image)} />}*/}
                <meta name="twitter:card" content="aaa_summary_large_image" />
                <meta property="og:title" content="aaa_title" />
                {/*{meta.twitter && <meta name="twitter:site" content={meta.twitter} />}*/}
                {/*{meta.image && <meta name="twitter:image" content={abs(meta.image)} />}*/}
            </Head>
            <PageMetadata description={meta.description ?? description} />
            <SkipToContent />
            <AnnouncementBar />
            <Navbar />
            {starProps?.repoUrl && starProps?.label && (
                <StarUs repoUrl={starProps.repoUrl} label={starProps.label} />
            )}
            <div className={clsx(ThemeClassNames.wrapper.main, styles.ozLayoutMainWrapper, className)}>
                <ErrorBoundary fallback={(params: any) => <ErrorPageContent {...params} />}>
                    {children}
                </ErrorBoundary>
                {!noFooter && props.footerProps && NetFoundryFooter(props.footerProps)}
            </div>

        </LayoutProvider>
    );
}
