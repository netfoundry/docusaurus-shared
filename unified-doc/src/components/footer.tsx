import {defaultNetFoundryFooterProps, defaultSocialProps} from "@netfoundry/docusaurus-theme/ui";
import React from "react";

export const unifiedFooter = {
    ...defaultNetFoundryFooterProps(),
    description:
        'Cloud isn’t always viable. NetFoundry On-Prem™ lets you control and manage your own OpenZiti overlay network.',
    socialProps: {
        ...defaultSocialProps,
        githubUrl: 'https://github.com/netfoundry/',
        youtubeUrl: 'https://youtube.com/netfoundry/',
        linkedInUrl: 'https://www.linkedin.com/in/netfoundry/',
        twitterUrl: 'https://twitter.com/netfoundry/',
    },
    documentationLinks: [
        <a key="new" href="/installation">Getting Starteda 4</a>
    ],
    communityLinks: [
        <a key="new" href="/installation">Getting Startedb 5</a>
    ],
    resourceLinks: [
        <a href="https://blog.openziti.io">OpenZiti Tech Blog</a>,
        <a href="https://netfoundry.io/">NetFoundry</a>,
    ],
}
