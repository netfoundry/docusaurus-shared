import {defaultNetFoundryFooterProps, defaultSocialProps} from "@openclint/docusaurus-shared";

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
        <a key="new" href="/installation">Getting Startedc 6</a>
    ],
}