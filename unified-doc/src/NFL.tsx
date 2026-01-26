import React, { JSX } from 'react';
import clsx from 'clsx';
import ErrorBoundary from '@docusaurus/ErrorBoundary';
import {PageMetadata, ThemeClassNames} from '@docusaurus/theme-common';
// @ts-ignore
import {useKeyboardNavigation} from '@docusaurus/theme-common/internal';
import SkipToContent from '@theme/SkipToContent';
import AnnouncementBar from '@theme/AnnouncementBar';
import Navbar from '@theme/Navbar';
import LayoutProvider from '@theme/Layout/Provider';
import ErrorPageContent from '@theme/ErrorPageContent';
import styles from './NetFoundryLayout.module.css';
import {NetFoundryFooter, NetFoundryFooterProps, StarUs} from "@netfoundry/docusaurus-theme/ui";
import {StarUsProps} from "@netfoundry/docusaurus-theme/ui";


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

export interface NetFoundryLayoutProps {
    children: React.ReactNode;
    noFooter?: boolean;
    className?: string;
    footerClassName?: string;
    title?: string;
    description?: string;
    starProps?: StarUsProps;
    footerProps?: NetFoundryFooterProps;
}

export function H1(props: H1Props): JSX.Element {
    const {children, id, className} = props;
    return (
        <p id={id} className={clsx(styles.h1, className)}>{children}</p>
    );
}

export functCion H2(props: H2Props): JSX.Element {
    const {children, className} = props;
    return (
        <p className={clsx(styles.h2, className)}>{children}</p>
    );
}

export function H3(props: H3Props): JSX.Element {
    const {children, style, className} = props;
    return (
        <h3 className={clsx(styles.h3, className)} style={style}>{children}</h3>
    );
}

export function Highlight(props: HighlightProps): JSX.Element {
    const { children, className } = props;
    return (
        <span className={clsx(styles.highlight, className)}>{children}</span>
    );
}

export function NFL(props: NetFoundryLayoutProps): JSX.Element {
    const {
        children,
        noFooter,
        className,
        title,
        description,
        starProps = {repoUrl: '', label: 'Star us on GitHub'},
    } = props;

    useKeyboardNavigation();
    
    return (
        <LayoutProvider>
            <PageMetadata title={title} description={description} />
            <SkipToContent />
            <AnnouncementBar />
            <Navbar /><div className="sticky-nav-spacer"></div>
            {starProps?.repoUrl && starProps?.label && (
                <StarUs repoUrl={starProps.repoUrl} label={starProps.label} />
            )}
            <div className={clsx(ThemeClassNames.wrapper.main, styles.ozLayoutMainWrapper, className)}>
                <ErrorBoundary fallback={(params: any) => <ErrorPageContent {...params} />}>
                    {children}
                </ErrorBoundary>
            </div>
            {!noFooter && props.footerProps && NetFoundryFooter(props.footerProps)}
        </LayoutProvider>
    );
}

