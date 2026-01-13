import type { Config } from '@docusaurus/types';
import path from "node:path";
import {themes as prismThemes} from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)
const frontdoor = `./_remotes/frontdoor`;
const onprem = `./_remotes/onprem`;
const openziti = `./_remotes/openziti`;
const zrok = `./_remotes/zrok`;
const zlan = `./_remotes/zlan`;
const docsBase = `/docs`

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
        indexName: 'netfoundry.io_UWUTF7ESUI',
    },
    hotjar: {
        id: "6506483"
    }
}

const cfg: PublishConfig = process.env.DOCUSAURUS_PUBLISH_ENV == 'prod' ? prod : staging;

export default {
    title: 'This is the title of the site',
    url: 'https://netfoundry.io',
    baseUrl: '/',

    plugins: [
        function webpackAliases() {
            return {
                name: 'unified-doc-webpack-aliases',
                configureWebpack(config, isServer) {
                    return {
                        resolve: {
                            alias: {
                                "@openclint/docusaurus-shared/ui": path.resolve(__dirname, "../docusaurus-shared/src/ui.ts"),
                                '@openziti': path.resolve(__dirname, `${openziti}/docusaurus`),
                                '@frontdoor': path.resolve(__dirname, `${frontdoor}/docusaurus`),
                                '@zrok': path.resolve(__dirname, `${zrok}/docusaurus`),
                                '@onprem': path.resolve(__dirname, `${onprem}/docs-site`),
                                '@zlan': path.resolve(__dirname, `${zlan}/docusaurus`),
                            },
                        },
                    };
                },
            };
        },
    ],
    presets: [
        ['classic', {
            docs: {
                routeBasePath: '/docs',
                sidebarPath: './sidebars.ts'
            },
            blog: {
                routeBasePath: '/blog',
                showReadingTime: true,
                feedOptions: {
                    type: 'all',
                    title: 'NetFoundry Blog',
                    description: 'Latest updates from NetFoundry',
                },
            },
            theme: {
                customCss: require.resolve('./src/custom/custom.css'),
            }
        }
    ]
    ],

    themeConfig: {
        // Replace with your project's social card
        image: 'https://netfoundry.io/wp-content/uploads/2024/07/netfoundry-logo-tag-color-stacked-1.svg',
        navbar: {
            hideOnScroll: false,
            title: 'NetFoundry Documentation',
            logo: {
                alt: 'NetFoundry Logo',
                src: 'https://raw.githubusercontent.com/netfoundry/branding/refs/heads/main/images/svg/icon/netfoundry-icon-color.svg',
            },
            items: [
                {
                    label: 'Docs',
                    position: 'left',
                    items: [
                        { to: 'https://localhost/onprem/intro', label: 'On-Prem' },
                        { to: 'https://localhost/frontdoor/intro', label: 'Frontdoor' },
                        { to: 'https://localhost/openziti/learn/introduction', label: 'OpenZiti' },
                    ],
                },
                {
                    to: '/blog',
                    label: 'Blog',
                    position: 'left'
                },
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
