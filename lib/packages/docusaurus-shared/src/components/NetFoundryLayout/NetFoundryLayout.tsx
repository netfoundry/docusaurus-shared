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

export interface H1Props {
    children: React.ReactNode;
    id?: string;
    className?: string;
}
export interface H2Props {
    children: React.ReactNode;
    className?: string;
}
export interface H3Props {
    children: React.ReactNode;
    style?: React.CSSProperties;
    className?: string;
}
export interface HighlightProps {
    children: React.ReactNode;
    className?: string;
}

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

export function H1(props: H1Props): JSX.Element {
    const { children, id, className } = props;
    return <p id={id} className={clsx(styles.h1, className)}>{children}</p>;
}
export function H2(props: H2Props): JSX.Element {
    const { children, className } = props;
    return <p className={clsx(styles.h2, className)}>{children}</p>;
}
export function H3(props: H3Props): JSX.Element {
    const { children, style, className } = props;
    return <h3 className={clsx(styles.h3, className)} style={style}>{children}</h3>;
}
export function Highlight(props: HighlightProps): JSX.Element {
    const { children, className } = props;
    return <span className={clsx(styles.highlight, className)}>{children}</span>;
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
            <PageMetadata title={title} description={description} />
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
