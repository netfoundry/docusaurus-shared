import React, {JSX} from "react";
import Head from "@docusaurus/Head";
import useBaseUrl from "@docusaurus/useBaseUrl";

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

export interface SocialHeadProps {
    socialMeta: SocialMetadata;
}

function useAbsoluteUrl() {
    const baseUrl = useBaseUrl('/');

    return (path?: string) => {
        if (!path) return undefined;
        if (path.startsWith("http")) return path;

        // During SSR, use the baseUrl without window
        if (typeof window === 'undefined') {
            return useBaseUrl(path);
        }

        return new URL(useBaseUrl(path), window.location.origin).toString();
    };
}

export function SocialHead({ socialMeta }: SocialHeadProps): JSX.Element {
    const absoluteUrl = useAbsoluteUrl();

    return (
        <Head>
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
        </Head>
    );
}