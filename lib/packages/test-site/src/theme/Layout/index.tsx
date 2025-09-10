import React, {type ReactNode} from 'react';
import clsx from 'clsx';
import ErrorBoundary from '@docusaurus/ErrorBoundary';
import {
  PageMetadata,
  SkipToContentFallbackId,
  ThemeClassNames,
} from '@docusaurus/theme-common';
import {useKeyboardNavigation} from '@docusaurus/theme-common/internal';
import SkipToContent from '@theme/SkipToContent';
import AnnouncementBar from '@theme/AnnouncementBar';
import Navbar from '@theme/Navbar';
import Footer from '@theme/Footer';
import LayoutProvider from '@theme/Layout/Provider';
import ErrorPageContent from '@theme/ErrorPageContent';
import type {Props} from '@theme/Layout';
import styles from './styles.module.css';
import {NetFoundryLayout, NetFoundryLayoutProps, StarUsProps} from '@openclint/docusaurus-shared/ui';
import {unifiedFooter} from "@site/src/footer";
import useDocusaurusContext from "@docusaurus/core/lib/client/exports/useDocusaurusContext";

export default function Layout(props: Props): ReactNode {
    const {
        children,
        noFooter,
        wrapperClassName,
        // Not really layout-related, but kept for convenience/retro-compatibility
        title,
        description,
    } = props;

    useKeyboardNavigation();
    const {siteConfig} = useDocusaurusContext();

    return (
        <NetFoundryLayout title={title} description={description} footerProps={unifiedFooter} meta={{siteName: siteConfig.title}}>
            {props.children}
        </NetFoundryLayout>
    );
}
