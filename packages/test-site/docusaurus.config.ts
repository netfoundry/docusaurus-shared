import type { Config, PluginConfig } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import path from "node:path"
import {themes as prismThemes} from 'prism-react-renderer';
import {zrokDocsPluginConfig} from "./remotes/zrok/website/docusaurus-plugin-zrok-docs";
import {openzitiDocsPluginConfig} from "./remotes/openziti/docusaurus/docusaurus-plugin-openziti-docs";
import {frontdoorDocsPluginConfig} from "./remotes/frontdoor/docusaurus/docusaurus-plugin-frontdoor-docs";
import {onpremDocsPluginConfig} from "./remotes/onprem/docusaurus/docusaurus-plugin-onprem-docs";
import {zlanDocsPluginConfig} from "./remotes/zlan/docusaurus/docusaurus-plugin-zlan-docs";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

// Sub-project paths (mirrors unified-doc structure)
const frontdoor = `./remotes/frontdoor`;
const onprem = `./remotes/onprem`;
const openziti = `./remotes/openziti`;
const zlan = `./remotes/zlan`;
const zrokRoot = `./remotes/zrok/website`;

interface PublishConfig {
    docusaurus: { url: string };
    algolia: { appId: string; apiKey: string; indexName: string };
    hotjar: { id: string };
}

const staging: PublishConfig = {
    docusaurus: {
        url: 'https://netfoundry.io'
    },
    algolia: {
        appId: 'QRGW6TJXHP',
        apiKey: '267457291182a398c5ee19fcb0bcae77',
        indexName: 'nfdocs_stg',
    },
    hotjar: {
        id: "6443487"
    }
}

const prod: PublishConfig = {
    docusaurus: {
        url: 'https://netfoundry.io'
    },
    algolia: {
        appId: 'UWUTF7ESUI',
        apiKey: '3a4a0691d0e8e3bb7c27c702c6a86ea9',
        // Match unified-doc/prod. The crawler writes the custom `nfdocs` index
        // (see unified-doc/algolia-prod-crawler.json), not the auto-named
        // `netfoundry.io_UWUTF7ESUI` index, so test-site must query `nfdocs`
        // to mirror what production search actually hits.
        indexName: 'nfdocs',
    },
    hotjar: {
        id: "6506483"
    }
}

const cfg: PublishConfig = process.env.DOCUSAURUS_PUBLISH_ENV == 'prod' ? prod : staging;

const REMARK_MAPPINGS: { from: string; to: string }[] = [];

export default {
    title: 'Test Site - Unified Doc Structure',
    url: 'https://netfoundry.io',
    baseUrl: '/',
    // DEV-ONLY debug probe button (self-gates to NODE_ENV !== 'production').
    // Remove this line + delete src/debug/mobile-probe.js when done debugging.
    clientModules: [require.resolve('./src/debug/mobile-probe.js')],
    customFields: {
        ALGOLIA_APPID:    cfg.algolia.appId,
        ALGOLIA_APIKEY:   cfg.algolia.apiKey,
        ALGOLIA_INDEXNAME: cfg.algolia.indexName,
    },

    // Register the NetFoundry theme (local path for development)
    themes: [
        ['@docusaurus/theme-classic', {
            customCss: [
                require.resolve('./src/custom/custom.css'),
                require.resolve('../docusaurus-theme/css/product-picker.css'),
            ],
        }],
        path.resolve(__dirname, '../docusaurus-theme'),
        '@docusaurus/theme-mermaid',
        '@docusaurus/theme-search-algolia',
    ],

    markdown: {
        mermaid: true,
        // Per-file detection by extension: .md uses CommonMark (looser, accepts
        // {#heading-id}, raw <!-- comments -->, stray braces), .mdx uses strict MDX.
        // Matches unified-doc so upstream content from _remotes/ parses consistently.
        format: 'detect',
    },

    staticDirectories: [
        'static',
        '../../unified-doc/static',
        `${frontdoor}/docusaurus/static`,
        `${onprem}/docusaurus/static`,
        `${openziti}/docusaurus/static`,
        `${zlan}/docusaurus/static`,
        `${zrokRoot}/static`,
    ],

    plugins: [
        ['@docusaurus/plugin-content-docs', {
            routeBasePath: '/docs',
            sidebarPath: './sidebars.ts',
        }],
        ['@docusaurus/plugin-content-pages', {}],
        // Webpack aliases for sub-project imports (mirrors unified-doc)
        function webpackAliases() {
            return {
                name: 'test-site-webpack-aliases',
                configureWebpack() {
                    return {
                        resolve: {
                            alias: {
                                '@openziti': path.resolve(__dirname, `${openziti}/docusaurus`),
                                '@frontdoor': path.resolve(__dirname, `${frontdoor}/docusaurus`),
                                '@onprem': path.resolve(__dirname, `${onprem}/docusaurus`),
                                '@zlan': path.resolve(__dirname, `${zlan}/docusaurus`),
                                '@zrok': path.resolve(__dirname, `${zrokRoot}`),
                                '@zrokroot': path.resolve(__dirname, `${zrokRoot}`),
                                '@netfoundry/docusaurus-theme/ui': path.resolve(__dirname, '../docusaurus-theme/dist/src/ui.js'),
                                '@netfoundry/docusaurus-theme/plugins': path.resolve(__dirname, '../docusaurus-theme/dist/src/plugins.js'),
                                '@netfoundry/docusaurus-theme/node': path.resolve(__dirname, '../docusaurus-theme/dist/src/node.js'),
                            },
                        },
                    };
                },
            };
        },

        // Sub-project docs plugins (same pattern as unified-doc)
        openzitiDocsPluginConfig(`${openziti}/docusaurus`, REMARK_MAPPINGS, 'docs/openziti'),
        frontdoorDocsPluginConfig(`${frontdoor}/docusaurus`, REMARK_MAPPINGS, 'docs/frontdoor'),
        onpremDocsPluginConfig(`${onprem}/docusaurus`, REMARK_MAPPINGS, 'docs/onprem'),
        zlanDocsPluginConfig(`${zlan}/docusaurus`, REMARK_MAPPINGS, 'docs/zlan'),
        zrokDocsPluginConfig(zrokRoot, REMARK_MAPPINGS, 'docs/zrok'),
    ].filter(Boolean) as PluginConfig[],

    presets: [],

    themeConfig: {
        // NetFoundry theme configuration
        netfoundry: {
            starBanners: [
                { pathPrefix: '/docs/openziti', repoUrl: 'https://github.com/openziti/ziti', label: 'Star OpenZiti on GitHub' },
                { pathPrefix: '/docs/zrok',     repoUrl: 'https://github.com/openziti/zrok', label: 'Star zrok on GitHub'     },
                // DEMO-ONLY catch-all (no pathPrefix) so the banner renders on every test-site page.
                // Why it's here: the two entries above are path-gated to /docs/openziti and /docs/zrok,
                // and the test-site has no pages under those prefixes, so without this the banner never
                // shows. Exercising the real path-gated behavior would need a doc tree under those
                // prefixes (effectively a second test site), which we deliberately don't have.
                // TO REMOVE: delete just this one line -- the path-gated entries above are the real
                // production-style config and should stay.
                { repoUrl: 'https://github.com/netfoundry/docusaurus-shared', label: 'Star us on GitHub' },
            ],
            // productPickerColumns intentionally omitted — the theme provides
            // the canonical NetFoundry picker via @netfoundry/docusaurus-theme/products.
            // Add `self: '<productId>'` here to make this site's own product link to '/'.
            resourcesPickerSections: [
                {
                    header: 'Learn & Engage',
                    links: [
                        {
                            label: 'NetFoundry Blog',
                            description: 'Latest news, updates, and insights from NetFoundry.',
                            href: 'https://netfoundry.io/blog/',
                            logoUrl: 'https://raw.githubusercontent.com/netfoundry/branding/refs/heads/main/images/svg/icon/netfoundry-icon-color.svg',
                        },
                        {
                            label: 'OpenZiti Tech Blog',
                            description: 'Technical articles and community updates.',
                            href: 'https://blog.openziti.io/',
                            logoUrl: 'https://netfoundry.io/docs/img/openziti-sm-logo.svg',
                        },
                    ],
                },
                {
                    header: 'Community & Support',
                    links: [
                        {
                            label: 'NetFoundry YouTube',
                            description: 'Video tutorials, demos, and technical deep dives.',
                            href: 'https://www.youtube.com/c/NetFoundry',
                            logoUrl: 'https://raw.githubusercontent.com/netfoundry/branding/refs/heads/main/images/svg/icon/netfoundry-icon-color.svg',
                            badge: 'youtube',
                        },
                        {
                            label: 'OpenZiti YouTube',
                            description: 'OpenZiti community videos and project updates.',
                            href: 'https://www.youtube.com/openziti',
                            logoUrl: 'https://netfoundry.io/docs/img/openziti-sm-logo.svg',
                            badge: 'youtube',
                        },
                        {
                            label: 'OpenZiti Discourse',
                            description: 'Ask questions and connect with the community.',
                            href: 'https://openziti.discourse.group/',
                            iconName: 'discourse',
                        },
                    ],
                },
            ],
            navbarIconLinks: [
                { href: 'https://reddit.com/r/openziti',    title: 'Reddit',  iconName: 'reddit',  pathPrefixes: ['/docs/openziti'] },
                { href: 'https://x.com/openziti',           title: 'X',       iconName: 'x',       pathPrefixes: ['/docs/openziti'] },
                { href: 'https://www.youtube.com/openziti', title: 'YouTube', iconName: 'youtube', pathPrefixes: ['/docs/openziti'] },
                { href: 'https://github.com/openziti/ziti', title: 'GitHub',  iconName: 'github',  pathPrefixes: ['/docs/openziti'] },
                { href: 'https://github.com/openziti/zrok', title: 'GitHub', iconName: 'github', pathPrefixes: ['/docs/zrok']     },
                { href: 'https://openziti.discourse.group/', title: 'Discourse', iconName: 'discourse' },
                // Catch-all GitHub icon (no pathPrefixes) so it renders next to discourse on every
                // test-site page -- demonstrates the github icon styling alongside discourse.
                { href: 'https://github.com/netfoundry/docusaurus-shared', title: 'GitHub', iconName: 'github' },
            ],
            versionBanners: [
                {
                    pathPrefix: '/docs/openziti/latest',
                    message: 'This is the latest development documentation and may describe features not yet available in a long-term-stable (LTS) release. See the release policy for more information. For stable documentation, see Active LTS (2.0.x).',
                    type: 'info',
                    links: [
                        { text: 'release policy', href: 'https://github.com/openziti/ziti/blob/main/RELEASE_POLICY.md' },
                    ],
                    versionLink: {
                        text: 'Active LTS (2.0.x)',
                        fallbackHref: '/docs/openziti/intro',
                    },
                },
                {
                    pathPrefix: '/docs/openziti/maint',
                    message: 'Maintenance LTS (1.6.x) — receives security fixes and critical production defect patches only. See the release policy for more information. For new features and active support, see Active LTS (2.0.x).',
                    type: 'warning',
                    links: [
                        { text: 'release policy', href: 'https://github.com/openziti/ziti/blob/main/RELEASE_POLICY.md' },
                    ],
                    versionLink: {
                        text: 'Active LTS (2.0.x)',
                        fallbackHref: '/docs/openziti/intro',
                    },
                },
            ],
            footer: {
                description: 'This is just a test site for the NetFoundry Docusaurus theme.',
                socialProps: {
                    githubUrl: 'https://github.com/netfoundry/',
                    youtubeUrl: 'https://youtube.com/netfoundry/',
                    linkedInUrl: 'https://www.linkedin.com/company/netfoundry/',
                    twitterUrl: 'https://twitter.com/netfoundry/',
                },
            },
        },
        // Replace with your project's social card
        image: 'https://netfoundry.io/wp-content/uploads/2024/07/netfoundry-logo-tag-color-stacked-1.svg',
        navbar: {
            hideOnScroll: false,
            title: '',
            logo: {
                alt: 'NetFoundry Logo',
                src: 'https://netfoundry.io/docs/img/netfoundry-name-and-logo.svg',
            },
            items: [
                // Product icon between the NetFoundry logo and "Products", mirroring how the real
                // product sites show their project logo there. type: 'html' lets us drop in an <img>;
                // sizing lives in src/custom/custom.css (.nf-navbar-product-icon).
                {
                    type: 'html',
                    position: 'left',
                    value: '<a href="/" class="nf-navbar-product-icon" title="OpenZiti home"><img src="https://netfoundry.io/docs/img/openziti-sm-logo.svg" alt="OpenZiti" /><span class="nf-navbar-product-icon__label">OpenZiti</span></a>',
                },
                { type: 'custom-productPicker',   position: 'left' },
                { type: 'custom-versionDropdown', position: 'left', docsPluginId: 'zrok', pathPrefix: '/docs/zrok' },
                { type: 'custom-resourcesPicker', position: 'left' },
                { type: 'custom-iconLinks',        position: 'right' },
            ],
        },
        prism: {
            theme: prismThemes.github,
            darkTheme: prismThemes.dracula,
        },
        algolia: {
            appId: cfg.algolia.appId,
            apiKey: cfg.algolia.apiKey,
            indexName: cfg.algolia.indexName,
            contextualSearch: true,
            searchParameters: {},
            searchPagePath: 'search'
        },
        hotjar: {
            applicationId: cfg.hotjar.id
        },
    } satisfies Preset.ThemeConfig,
} satisfies Config;
