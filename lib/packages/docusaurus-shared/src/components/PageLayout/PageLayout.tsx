import React, {JSX} from "react";
import { BaseLayout, BaseLayoutProps, SocialMetadata } from "../BaseLayout";

export interface PageLayoutProps extends Omit<BaseLayoutProps, 'layoutType' | 'socialMeta'> {
    socialMeta?: SocialMetadata & {
        pageType?: "landing" | "feature" | "about" | "contact";
    };
}

export function PageLayout({
    socialMeta,
    ...baseProps
}: PageLayoutProps): JSX.Element {
    const enhancedSocialMeta: SocialMetadata = {
        type: "website",
        ...socialMeta,
    };

    return (
        <BaseLayout
            {...baseProps}
            layoutType="page"
            socialMeta={enhancedSocialMeta}
        />
    );
}