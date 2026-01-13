import React, {JSX} from "react";
import clsx from "clsx";
import ErrorBoundary from "@docusaurus/ErrorBoundary";
import { ThemeClassNames } from "@docusaurus/theme-common";
import { useKeyboardNavigation } from "@docusaurus/theme-common/internal";
import Head from "@docusaurus/Head";
import useBaseUrl from "@docusaurus/useBaseUrl";

import SkipToContent from "@theme/SkipToContent";
import AnnouncementBar from "@theme/AnnouncementBar";
import Navbar from "@theme/Navbar";
import ErrorPageContent from "@theme/ErrorPageContent";

import { NetFoundryFooter, NetFoundryFooterProps } from "../NetFoundryFooter";
import { StarUs, StarUsProps } from "../StarUs";
import { version } from '../../version';

export interface SocialMetadata {
    title?: string;
    description?: string;
    url?: string;
    image?: string;
    siteName?: string;
    locale?: string;
    twitterX?: {
        card?: "summary" | "summary_large_image" | "player" | "app";
        site?: string;
        creator?: string;
        imageAlt?: string;
    };
    type?: "website" | "article" | "profile";
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
    tags?: string[];
}

export interface BaseLayoutProps {
    children: React.ReactNode;
    noFooter?: boolean;
    className?: string;
    footerClassName?: string;
    title?: string;
    description?: string;
    starProps?: StarUsProps;
    footerProps?: NetFoundryFooterProps;
    socialMeta?: SocialMetadata;
    layoutType?: "page" | "doc" | "blog";
}

function useAbsoluteUrl() {
    return (path?: string) => {
        if (!path) return undefined;
        if (path.startsWith("http")) return path;

        // During SSR, just return the base URL
        if (typeof window === 'undefined') {
            return useBaseUrl(path);
        }

        return new URL(useBaseUrl(path), window.location.origin).toString();
    };
}

function generatePageTitle(
    socialMeta?: SocialMetadata,
    fallbackTitle?: string
): string {
    const title = socialMeta?.title ?? fallbackTitle ?? "";
    const siteName = socialMeta?.siteName;
    return title + (siteName ? ` | ${siteName}` : "");
}

function SocialMetaTags({ socialMeta, absoluteUrl }: {
    socialMeta?: SocialMetadata;
    absoluteUrl: (path?: string) => string | undefined;
}): JSX.Element {
    if (!socialMeta) return <></>;

    return (
        <>
            {socialMeta.description && (
                <meta name="description" content={socialMeta.description} />
            )}

            {/* Open Graph */}
            {socialMeta.url && <meta property="og:url" content={socialMeta.url} />}
            {socialMeta.siteName && <meta property="og:site_name" content={socialMeta.siteName} />}
            {socialMeta.title && <meta property="og:title" content={socialMeta.title} />}
            {socialMeta.description && (
                <meta property="og:description" content={socialMeta.description} />
            )}
            {socialMeta.image && <meta property="og:image" content={absoluteUrl(socialMeta.image)} />}
            {socialMeta.locale && <meta property="og:locale" content={socialMeta.locale} />}
            {socialMeta.type && <meta property="og:type" content={socialMeta.type} />}
            {socialMeta.publishedTime && (
                <meta property="article:published_time" content={socialMeta.publishedTime} />
            )}
            {socialMeta.modifiedTime && (
                <meta property="article:modified_time" content={socialMeta.modifiedTime} />
            )}
            {socialMeta.author && <meta property="article:author" content={socialMeta.author} />}
            {socialMeta.section && <meta property="article:section" content={socialMeta.section} />}
            {socialMeta.tags?.map((tag, index) => (
                <meta key={index} property="article:tag" content={tag} />
            ))}

            {/* Twitter/X */}
            <meta name="twitter:card" content={socialMeta.twitterX?.card ?? "summary_large_image"} />
            {socialMeta.twitterX?.site && (
                <meta name="twitter:site" content={socialMeta.twitterX.site} />
            )}
            {socialMeta.twitterX?.creator && (
                <meta name="twitter:creator" content={socialMeta.twitterX.creator} />
            )}
            {socialMeta.image && (
                <meta name="twitter:image" content={absoluteUrl(socialMeta.image)} />
            )}
            {socialMeta.twitterX?.imageAlt && (
                <meta name="twitter:image:alt" content={socialMeta.twitterX.imageAlt} />
            )}
        </>
    );
}

export function BaseLayout({
    children,
    noFooter,
    className,
    title,
    description,
    starProps = { repoUrl: "", label: "Star us on GitHub" },
    footerProps,
    socialMeta,
    layoutType = "page",
}: BaseLayoutProps): JSX.Element {
    useKeyboardNavigation();

    const absoluteUrl = useAbsoluteUrl();
    const pageTitle = generatePageTitle(socialMeta, title);

    const mergedSocialMeta: SocialMetadata = {
        description: description,
        ...socialMeta,
        type: socialMeta?.type ?? (layoutType === "doc" ? "article" : "website"),
    };

    return (
        <>
            <Head>
                <title>{pageTitle}</title>
                <meta data-rh="true" name="nf-layout-version" content={version} />
                <meta data-rh="true" name="nf-layout-type" content={layoutType} />
                <SocialMetaTags socialMeta={mergedSocialMeta} absoluteUrl={absoluteUrl} />
            </Head>
            <SkipToContent />
            <AnnouncementBar />
            <Navbar />
            {starProps.repoUrl && starProps.label && <StarUs {...starProps} />}
            <div
                className={clsx(
                    ThemeClassNames.wrapper.main,
                    "nf-base-layout-main-wrapper",
                    className,
                )}
            >
                <ErrorBoundary fallback={<ErrorPageContent />}>
                    {children}
                </ErrorBoundary>
                {!noFooter && footerProps && <NetFoundryFooter {...footerProps} />}
            </div>
        </>
    );
}