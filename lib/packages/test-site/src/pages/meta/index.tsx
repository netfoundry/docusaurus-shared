import React, {JSX} from 'react';
import Layout from '@theme/Layout';
import {Alert, NetFoundryHorizontalSection, SocialHead, createSocialPreview, pageSocialPreviewTemplate} from '@openclint/docusaurus-shared/ui';

const socialConfig = {
    siteName: "NetFoundry Test Site",
    defaultImage: "https://netfoundry.io/wp-content/uploads/2024/07/netfoundry-logo-tag-color-stacked-1.svg",
    twitterSite: "@netfoundry",
    locale: "en_US",
};

const generateSocialMeta = createSocialPreview(socialConfig, pageSocialPreviewTemplate);

export default function MetaPage(): JSX.Element {
    const socialMeta = generateSocialMeta({
        title: "Advanced Meta Controls",
        description: "This page demonstrates how to use custom social media metadata with the new SocialHead component.",
        image: "/img/pages/meta.png",
        type: "website",
        twitterX: {
            card: "summary_large_image",
            creator: "@netfoundrydevs"
        }
    });

    return (
        <Layout
            title="Meta Test Page"
            description="Testing advanced social media metadata controls"
        >
            <SocialHead socialMeta={socialMeta} />
            <main className="container margin-vert--lg">
                <NetFoundryHorizontalSection >
                    <NetFoundryHorizontalSection>
                        <h1>Meta Test Page</h1>
                        <p>This page demonstrates advanced social media metadata controls using the SocialHead component.</p>
                        <p>Check the page source to see the Open Graph and Twitter Card meta tags.</p>
                        <p>This showcases the new social preview utility and component system.</p>
                        <Alert title="Social Meta Tags" type="info" />
                        <Alert title="Open Graph Support" type="success" />
                        <Alert title="Twitter Card Support" type="success" />
                        <Alert title="SocialHead Component" type="warning" />
                    </NetFoundryHorizontalSection>
                </NetFoundryHorizontalSection>
            </main>
        </Layout>
    );
}