import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import * as path from "node:path";
import remarkReplaceMetaUrl from "./_remotes/openziti/docusaurus/src/plugins/remark/remark-replace-meta-url";
import {DOCUSAURUS_BASE_PATH, DOCUSAURUS_DEBUG, DOCUSAURUS_DOCS_PATH, DOCUSAURUS_CANONICAL_DOMAIN} from "@openclint/docusaurus-shared/node";
import {remarkScopedPath} from "./_remotes/openziti/docusaurus/src/plugins/remark/remarkScopedPath";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)
const frontdoor = `./_remotes/frontdoor`;
const onprem = `./_remotes/onprem`;
const openziti = `./_remotes/openziti`;
const zrok = `./_remotes/zrok`;

interface DocusaurusConfig {
    url: string;
}

interface AlgoliaConfig {
    appId: string;
    apiKey: string;
    indexName: string;
}

interface HotjarConfig {
    id: string;
}

interface PublishConfig {
    docusaurus: DocusaurusConfig;
    algolia: AlgoliaConfig;
    hotjar: HotjarConfig;
}

const staging: PublishConfig = {
    docusaurus: {
        url: 'https://stg-netfoundry-stg.kinsta.cloud'
    },
    algolia: {
        appId: 'QRGW6TJXHP',
        apiKey: '267457291182a398c5ee19fcb0bcae77',
        indexName: 'stg_netfoundry_stg_kinsta_cloud_qrgw6tjxhp',
    },
    hotjar: {
        id: ""
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
        id: ""
    }
}

const cfg: PublishConfig = process.env.DOCUSAURUS_PUBLISH_ENV == 'prod' ? prod : staging;

const config: Config = {
    title: 'NetFoundry Documentation',
    tagline: 'Documentation for NetFoundry products and projects',
    favicon: 'https://raw.githubusercontent.com/netfoundry/branding/refs/heads/main/images/png/icon/netfoundry-icon-color.png',

    // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
    future: {
        v4: true, // Improve compatibility with the upcoming Docusaurus v4
    },

    // Set the production url of your site here
    url: cfg.docusaurus.url,
    // Set the /<baseUrl>/ pathname under which your site is served
    // For GitHub pages deployment, it is often '/<projectName>/'
    baseUrl: '/docs',
    trailingSlash: true,

    // GitHub pages deployment config.
    // If you aren't using GitHub pages, you don't need these.
    organizationName: 'netfoundry', // Usually your GitHub org/user name.
    projectName: 'netfoundry', // Usually your repo name.

    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'throw',

    // Even if you don't use internationalization, you can use this field to set
    // useful metadata like html lang. For example, if your site is Chinese, you
    // may want to replace "en" with "zh-Hans".
    i18n: {
        defaultLocale: 'en',
        locales: ['en'],
    },
    themes: [
        ['@docusaurus/theme-classic', {
            customCss: require.resolve('./src/css/custom.css'),
        }],
        '@docusaurus/theme-mermaid',
        '@docusaurus/theme-search-algolia',
    ],
    staticDirectories: [
        'static',
        '_remotes/frontdoor/docusaurus/static/',
        '_remotes/onprem/docs-site/static/',
        '_remotes/openziti/docusaurus/static/'
    ],
    customFields: {
        DOCUSAURUS_BASE_PATH: DOCUSAURUS_BASE_PATH,
        DOCUSAURUS_DOCS_PATH: DOCUSAURUS_DOCS_PATH,
        OPENZITI_DOCS_BASE: '/'
    },
    plugins: [
        function webpackAliases() {
            return {
                name: 'unified-doc-webpack-aliases',
                configureWebpack(config, isServer) {
                    return {
                        resolve: {
                            alias: {
                                '@openziti': path.resolve(__dirname, `${openziti}/docusaurus`),
                                '@frontdoor': path.resolve(__dirname, `${frontdoor}/docusaurus`),
                                '@zrok': path.resolve(__dirname, `${zrok}/docusaurus`),
                                '@onprem': path.resolve(__dirname, `${onprem}/docs-site`),
                            },
                        },
                    };
                },
            };
        },
        ['@docusaurus/plugin-content-pages',{path: 'src/pages',routeBasePath: '/'}],
        ['@docusaurus/plugin-content-pages',{id: `frontdoor-pages`, path: `${frontdoor}/docusaurus/src/pages`, routeBasePath: '/frontdoor'}],
        ['@docusaurus/plugin-content-pages',{id: `onprem-pages`, path: `${onprem}/docs-site/src/pages`, routeBasePath: '/onprem'}],
        ['@docusaurus/plugin-content-pages',{id: `openziti-pages`, path: `${openziti}/docusaurus/src/pages`, routeBasePath: '/openziti'}],
        [
            '@docusaurus/plugin-content-docs',
            {
                id: 'nfonprem',
                path: `${onprem}/docs-site/docs`,
                routeBasePath: 'onprem',
                sidebarPath: `${onprem}/docs-site/sidebars.ts`,
                includeCurrentVersion: true,
            },
        ],
        [
            '@docusaurus/plugin-content-docs',
            {
                id: 'frontdoor',
                path: `${frontdoor}/docusaurus/docs`,
                routeBasePath: 'frontdoor',
                sidebarPath: `${frontdoor}/docusaurus/sidebars.ts`,
                includeCurrentVersion: true,
            },
        ],
        [
            '@docusaurus/plugin-content-docs',
            {
                id: 'openziti',
                path: `${openziti}/docusaurus/docs`,
                routeBasePath: 'openziti',
                sidebarPath: `${openziti}/docusaurus/sidebars.ts`,
                includeCurrentVersion: true,

                remarkPlugins: [
                    // require('./src/plugins/remark/remark-yaml-table'),
                    // require('./src/plugins/remark/remark-code-block'),
                    [remarkReplaceMetaUrl, {from: '_baseurl_', to: DOCUSAURUS_BASE_PATH}],
                    [remarkScopedPath,
                        {
                            debug: DOCUSAURUS_DEBUG,
                            mappings: [
                                {from: '@openzitidocs', to: '/docs/openziti'},
                            ],
                        },
                    ]
                ],
            },
        ],
        ['@docusaurus/plugin-sitemap', { changefreq: "daily", priority: 0.8 }],
    ],
    themeConfig: {
        // Replace with your project's social card
        image: 'img/docusaurus-social-card.jpg',
        navbar: {
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
                        { to: '/onprem/intro', label: 'On-Prem' },
                        { to: '/frontdoor/intro', label: 'Frontdoor' },
                        { to: '/openziti/learn/introduction', label: 'OpenZiti' },
                    ],
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
    } satisfies Preset.ThemeConfig,
    presets: [
        [  'redocusaurus',
            {
                specs: [
                    {
                        id: 'openapi',
                        spec: `${frontdoor}/docusaurus/docs/api-docs.yaml`,
                    },
                    {
                        id: 'edge-client',
                        spec: 'https://get.openziti.io/spec/client.yml',
                    },
                    {
                        id: 'edge-management',
                        spec: 'https://get.openziti.io/spec/management.yml',
                    },
                ],
                // Theme Options for modifying how redoc renders them
                theme: {
                    // Change with your site colors
                    primaryColor: '#1890ff',
                }
            },
        ],
    ],
};

export default config;
