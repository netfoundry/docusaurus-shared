import React, {JSX} from "react";
import { BaseLayout, BaseLayoutProps, SocialMetadata } from "../BaseLayout";

export interface BlogLayoutProps extends Omit<BaseLayoutProps, 'layoutType' | 'socialMeta'> {
    socialMeta?: SocialMetadata & {
        author?: string;
        publishDate?: string;
        readingTime?: string;
        category?: string;
    };
    blogMeta?: {
        author?: string;
        publishDate?: string;
        tags?: string[];
        category?: string;
        readingTime?: string;
    };
}

export function BlogLayout({
    socialMeta,
    blogMeta,
    ...baseProps
}: BlogLayoutProps): JSX.Element {
    const enhancedSocialMeta: SocialMetadata = {
        type: "article",
        publishedTime: blogMeta?.publishDate || socialMeta?.publishDate,
        author: blogMeta?.author || socialMeta?.author,
        section: blogMeta?.category || socialMeta?.category,
        tags: blogMeta?.tags || socialMeta?.tags,
        ...socialMeta,
    };

    return (
        <BaseLayout
            {...baseProps}
            layoutType="blog"
            socialMeta={enhancedSocialMeta}
        />
    );
}