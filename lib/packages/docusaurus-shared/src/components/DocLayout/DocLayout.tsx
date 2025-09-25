import React, {JSX} from "react";
import { BaseLayout, BaseLayoutProps, SocialMetadata } from "../BaseLayout";

export interface DocLayoutProps extends Omit<BaseLayoutProps, 'layoutType' | 'socialMeta'> {
    socialMeta?: SocialMetadata & {
        category?: string;
        readingTime?: string;
        lastUpdated?: string;
    };
    frontMatter?: {
        title?: string;
        description?: string;
        author?: string;
        category?: string;
        tags?: string[];
        date?: string;
        image?: string;
    };
}

export function DocLayout({
    socialMeta,
    frontMatter,
    title,
    description,
    ...baseProps
}: DocLayoutProps): JSX.Element {
    let enhancedTitle = title;
    let enhancedDescription = description;
    let enhancedSocialMeta = socialMeta;

    if (frontMatter) {
        enhancedTitle = title || frontMatter.title;
        enhancedDescription = description || frontMatter.description;

        enhancedSocialMeta = {
            type: "article",
            publishedTime: frontMatter.date,
            author: frontMatter.author,
            section: frontMatter.category,
            tags: frontMatter.tags,
            image: frontMatter.image,
            ...socialMeta,
            title: socialMeta?.title || enhancedTitle,
            description: socialMeta?.description || enhancedDescription,
        };
    } else {
        enhancedSocialMeta = {
            type: "article",
            ...socialMeta,
        };
    }

    return (
        <BaseLayout
            {...baseProps}
            layoutType="doc"
            title={enhancedTitle}
            description={enhancedDescription}
            socialMeta={enhancedSocialMeta}
        />
    );
}