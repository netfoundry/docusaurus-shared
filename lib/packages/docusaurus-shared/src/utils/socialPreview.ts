import { SocialMetadata } from "../components/BaseLayout";

export interface SocialPreviewConfig {
    siteName: string;
    defaultImage: string;
    twitterSite?: string;
    locale?: string;
    baseUrl?: string;
}

export interface SocialPreviewTemplate {
    title?: (originalTitle?: string) => string;
    description?: (originalDescription?: string) => string;
    image?: (originalImage?: string) => string;
}

export const createSocialPreview = (
    config: SocialPreviewConfig,
    template?: SocialPreviewTemplate
) => {
    return (meta: Partial<SocialMetadata> = {}): SocialMetadata => {
        const title = template?.title?.(meta.title) ?? meta.title;
        const description = template?.description?.(meta.description) ?? meta.description;
        const image = template?.image?.(meta.image) ?? meta.image ?? config.defaultImage;

        return {
            siteName: config.siteName,
            locale: config.locale ?? "en_US",
            twitterX: {
                card: "summary_large_image",
                site: config.twitterSite,
                ...meta.twitterX,
            },
            ...meta,
            title,
            description,
            image,
            url: meta.url ?? (config.baseUrl ? `${config.baseUrl}${window.location.pathname}` : undefined),
        };
    };
};

export const docSocialPreviewTemplate: SocialPreviewTemplate = {
    title: (title) => title ? `${title} - Documentation` : "Documentation",
    description: (desc) => desc || "Read our comprehensive documentation to learn more.",
    image: (image) => image, // Use provided image or fallback to default
};

export const blogSocialPreviewTemplate: SocialPreviewTemplate = {
    title: (title) => title ? `${title} - Blog` : "Blog Post",
    description: (desc) => desc || "Read the latest from our blog.",
    image: (image) => image, // Use provided image or fallback to default
};

export const pageSocialPreviewTemplate: SocialPreviewTemplate = {
    title: (title) => title || "NetFoundry",
    description: (desc) => desc || "Secure, programmable connectivity for distributed applications.",
    image: (image) => image, // Use provided image or fallback to default
};