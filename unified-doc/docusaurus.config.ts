import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import * as path from "node:path";
import {
    LogLevel,
    remarkCodeSections,
    remarkReplaceMetaUrl,
    remarkScopedPath,
    remarkYouTube
} from "@openclint/docusaurus-shared/plugins";
import remarkGithubAdmonitionsToDirectives from "remark-github-admonitions-to-directives";
import {pluginHotjar} from "@openclint/docusaurus-shared/node";
import {PublishConfig} from 'src/components/docusaurus'

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)
const frontdoor = `./_remotes/frontdoor`;
const onprem = `./_remotes/onprem`;
const openziti = `./_remotes/openziti`;
const zrok = `./_remotes/zrok`;
const zlan = `./_remotes/zlan`;
const docsBase = `/docs`

const buildMask = parseInt(process.env.DOCUSAURUS_BUILD_MASK ?? "0xFF", 16);

const BUILD_FLAGS = {
    NONE:      0x0,
    OPENZITI:  0x1,
    FRONTDOOR: 0x2,
    ONPREM:    0x4,
    ZROK:      0x8,
    ZLAN:      0x10,
};

function build(flag: number) {
    return (buildMask & flag) !== 0;
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
        indexName: 'nfdocs',
    },
    hotjar: {
        id: "6506483"
    }
}

const cfg: PublishConfig = process.env.DOCUSAURUS_PUBLISH_ENV == 'prod' ? prod : staging;

const REMARK_MAPPINGS = [
    { from: '@onpremdocs',   to: '/onprem' },
    { from: '@openzitidocs', to: `${docsBase}/openziti`},
    { from: '@static', to: `${docsBase}`},
];

console.log("CANONICAL URL      : " + cfg.docusaurus.url);
console.log("    docsBase       : " + docsBase);
console.log("    algolia index  : " + cfg.algolia.indexName);
console.log("    build mask     : " + buildMask);
console.log("    hotjar app     : " + cfg.hotjar.id);

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
    baseUrl: docsBase,
    // trailingSlash: false, leave as is

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
    markdown: {
        mermaid: true,
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
        '_remotes/openziti/docusaurus/static/',
        '_remotes/zlan/docusaurus/static/'
    ],
    customFields: {
        DOCUSAURUS_BASE_PATH: '/',
        DOCUSAURUS_DOCS_PATH: '/docs/',
        OPENZITI_DOCS_BASE: '/docs/openziti',
        UNIFIED_DOC_PATH: true
    },
    plugins: [
        function webpackAliases() {
            return {
                name: 'unified-doc-webpack-aliases',
                configureWebpack(config:any, isServer:any) {
                    return {
                        resolve: {
                            alias: {
                                '@openziti': path.resolve(__dirname, `${openziti}/docusaurus`),
                                '@frontdoor': path.resolve(__dirname, `${frontdoor}/docusaurus`),
                                '@zrok': path.resolve(__dirname, `${zrok}/docusaurus`),
                                '@onprem': path.resolve(__dirname, `${onprem}/docs-site`),
                                '@zlan': path.resolve(__dirname, `${zlan}/docusaurus`),
                                '@staticdir': path.resolve(__dirname, `docusaurus/static`),
                            },
                        },
                    };
                },
            };
        },

        ['@docusaurus/plugin-content-pages',{path: 'src/pages',routeBasePath: '/'}],
        build(BUILD_FLAGS.FRONTDOOR) && ['@docusaurus/plugin-content-pages',{id: `frontdoor-pages`, path: `${frontdoor}/docusaurus/src/pages`, routeBasePath: '/frontdoor'}],
        build(BUILD_FLAGS.ONPREM) && ['@docusaurus/plugin-content-pages',{id: `onprem-pages`, path: `${onprem}/docs-site/src/pages`, routeBasePath: '/onprem'}],
        build(BUILD_FLAGS.OPENZITI) && ['@docusaurus/plugin-content-pages',{id: `openziti-pages`, path: `${openziti}/docusaurus/src/pages`, routeBasePath: '/openziti'}],
        build(BUILD_FLAGS.ZLAN) && ['@docusaurus/plugin-content-pages',{id: `zlan-pages`, path: `${zlan}/docusaurus/src/pages`, routeBasePath: '/zlan'}],
        build(BUILD_FLAGS.ONPREM) && [
            '@docusaurus/plugin-content-docs',
            {
                id: 'nfonprem',
                path: `${onprem}/docs-site/docs`,
                routeBasePath: 'onprem',
                sidebarPath: `${onprem}/docs-site/sidebars.ts`,
                includeCurrentVersion: true,
                beforeDefaultRemarkPlugins: [
                    remarkGithubAdmonitionsToDirectives,
                ],
                remarkPlugins: [
                    [remarkScopedPath, { mappings: REMARK_MAPPINGS, debug: false }],
                    [remarkCodeSections, { logLevel: LogLevel.Silent }],
                ],
            },
        ],
        build(BUILD_FLAGS.FRONTDOOR) && [
            '@docusaurus/plugin-content-docs',
            {
                id: 'frontdoor',
                path: `${frontdoor}/docusaurus/docs`,
                routeBasePath: 'frontdoor',
                sidebarPath: `${frontdoor}/docusaurus/sidebars.ts`,
                includeCurrentVersion: true,
                beforeDefaultRemarkPlugins: [
                    remarkGithubAdmonitionsToDirectives,
                ],
                remarkPlugins: [
                    [remarkScopedPath, { mappings: REMARK_MAPPINGS, logLevel: LogLevel.Silent}],
                    [remarkCodeSections, { logLevel: LogLevel.Silent }],
                ],
            },
        ],
        build(BUILD_FLAGS.OPENZITI) && [
            '@docusaurus/plugin-content-docs',
            {
                id: 'openziti',
                path: `${openziti}/docusaurus/docs`,
                routeBasePath: 'openziti',
                sidebarPath: `${openziti}/docusaurus/sidebars.ts`,
                includeCurrentVersion: true,
                beforeDefaultRemarkPlugins: [
                    remarkGithubAdmonitionsToDirectives,
                ],
                remarkPlugins: [
                    [remarkReplaceMetaUrl, {from: '@staticoz', to: '/docs/openziti', logLevel: LogLevel.Silent}],
                    [remarkScopedPath, { mappings: REMARK_MAPPINGS, logLevel: LogLevel.Silent }],
                    [remarkCodeSections, { logLevel: LogLevel.Debug }],
                ],
            },
        ],
        build(BUILD_FLAGS.ZLAN) && [
            '@docusaurus/plugin-content-docs',
            {
                id: 'zlan',
                path: `${zlan}/docusaurus/docs`,
                routeBasePath: 'zlan',
                sidebarPath: `${zlan}/docusaurus/sidebars.ts`,
                includeCurrentVersion: true,
                beforeDefaultRemarkPlugins: [
                    remarkGithubAdmonitionsToDirectives,
                ],
                remarkPlugins: [
                    [remarkScopedPath, { mappings: REMARK_MAPPINGS, logLevel: LogLevel.Silent }],
                    [remarkCodeSections, { logLevel: LogLevel.Silent }],
                ],
            },
        ],
        build(BUILD_FLAGS.OPENZITI) && [
            '@docusaurus/plugin-content-blog',
            {
                showReadingTime: true,
                routeBasePath: 'openziti/blog',
                tagsBasePath: 'tags',
                include: ['**/*.{md,mdx}'],
                path: '_remotes/openziti/docusaurus/blog',
                remarkPlugins: [
                    remarkYouTube,
                    [remarkReplaceMetaUrl, {from: '@staticoz', to: '/docs/openziti', logLevel: LogLevel.Silent}],
                    [remarkScopedPath, { mappings: REMARK_MAPPINGS, logLevel: LogLevel.Silent }],
                    [remarkCodeSections, { logLevel: LogLevel.Silent }],
                ],
                blogSidebarCount: 'ALL',
                blogSidebarTitle: 'All posts',
            },
        ],
        ['@docusaurus/plugin-sitemap', { changefreq: "daily", priority: 0.8 }],
        [pluginHotjar, {}],
    ].filter(Boolean),
    themeConfig: {
        mermaid: {
            theme: {light: 'neutral', dark: 'forest'},
        },
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
        hotjar: {
            applicationId: cfg.hotjar.id
        },
    } satisfies Preset.ThemeConfig,
    presets: [
        [  'redocusaurus',
            {
                specs: [
                    {
                        id: 'openapi',
                        spec: `${frontdoor}/docusaurus/static/frontdoor-api-spec.yaml`,
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
