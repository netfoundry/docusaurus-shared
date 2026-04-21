import {themes as prismThemes} from 'prism-react-renderer';
import type {Config, PluginConfig} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import * as path from "node:path";
import {
    LogLevel,
    remarkCodeSections,
    remarkReplaceMetaUrl,
    remarkScopedPath,
    remarkYouTube
} from "@netfoundry/docusaurus-theme/plugins";
import remarkGithubAdmonitionsToDirectives from "remark-github-admonitions-to-directives";
import {pluginHotjar, pluginReo} from "@netfoundry/docusaurus-theme/node";
import {PublishConfig} from 'src/components/docusaurus'
import {zrokDocsPluginConfig, zrokRedirects} from "./_remotes/zrok/website/docusaurus-plugin-zrok-docs.ts";
import {onpremRedirects} from "./_remotes/selfhosted/docusaurus/docusaurus-plugin-onprem-docs.ts";
import {platformDocsPluginConfig, platformRedocSpecs} from "./_remotes/platform/docusaurus/docusaurus-plugin-platform-docs.ts";
import {frontdoorRedocSpecs} from "./_remotes/frontdoor/docusaurus/docusaurus-plugin-frontdoor-docs.ts";
import {openzitiRedocSpecs} from "./_remotes/openziti/docusaurus/docusaurus-plugin-openziti-docs.ts";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)
const frontdoor = `./_remotes/frontdoor`;
const selfhosted = `./_remotes/selfhosted`;
const openziti = `./_remotes/openziti`;
const zrokRoot = `./_remotes/zrok/website`;
const zlan = `./_remotes/zlan`;
const platform = `./_remotes/platform`;

const isVercel = process.env.IS_VERCEL === 'true';
const docsBase = isVercel ? '/' : '/docs/';


// On Vercel previews, the baseUrl needs to be '/', routes need a 'docs/' prefix to match hardcoded /docs/ links in remote content.
// On default non-Vercel-preview builds baseUrl is '/docs/'
function routeBase(name: string) {
    return isVercel ? `docs/${name}` : name;
}

const buildMask = parseInt(process.env.DOCUSAURUS_BUILD_MASK ?? "0xFF", 16);

const BUILD_FLAGS = {
    NONE:      0x0,
    OPENZITI:  0x1,
    FRONTDOOR: 0x2,
    SELFHOSTED: 0x4,
    ZROK:      0x8,
    ZLAN:      0x10,
    PLATFORM:  0x20,
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
    },
    google: {
        tag: 'GTM-5SF399H3'
    },
    reo: {
        clientId: '3bcf34995ffda6d'
    },
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
    },
    google: {
        tag: 'GTM-NHX4DX56'
    },
    reo: {
        clientId: '3bcf34995ffda6d'
    },
}

const cfg: PublishConfig = process.env.DOCUSAURUS_PUBLISH_ENV === 'prod' ? prod : staging;

const REMARK_MAPPINGS = [
    { from: '@selfhosteddocs', to: `${docsBase}selfhosted` },
    { from: '@openzitidocs', to: `${docsBase}openziti`},
    { from: '@zrokdocs', to: `${docsBase}zrok`},
    { from: '@frontdoordocs', to: `${docsBase}frontdoor`},
    { from: '@zlandocs', to: `${docsBase}zlan`},
    { from: '@platformdocs', to: `${docsBase}platform`},
    { from: '@static', to: docsBase},
    { from: '/openziti',   to: `${docsBase}${routeBase('openziti')}`   },
    { from: '/frontdoor',  to: `${docsBase}${routeBase('frontdoor')}`  },
    { from: '/selfhosted', to: `${docsBase}${routeBase('selfhosted')}` },
    { from: '/zrok',       to: `${docsBase}${routeBase('zrok')}`       },
    { from: '/zlan',       to: `${docsBase}${routeBase('zlan')}`       },
    { from: '/platform',   to: `${docsBase}${routeBase('platform')}`   },
];

console.log("CANONICAL URL          : " + cfg.docusaurus.url);
console.log("DOCUSAURUS_PUBLISH_ENV : " + process.env.DOCUSAURUS_PUBLISH_ENV)
console.log("    docsBase           : " + docsBase);
console.log("    algolia index      : " + cfg.algolia.indexName);
console.log("    build mask         : " + buildMask);
console.log("    hotjar app         : " + cfg.hotjar.id);
console.log('REMARK_MAPPINGS:', JSON.stringify(REMARK_MAPPINGS, null, 2));


function extendDocsPlugins(plugin: PluginConfig): PluginConfig {
    if (!Array.isArray(plugin)) return plugin;

    const [pluginName, config] = plugin;

    config.beforeDefaultRemarkPlugins = [
        ...(config.beforeDefaultRemarkPlugins || []),
        remarkGithubAdmonitionsToDirectives,
    ];

    config.remarkPlugins = [
        ...(config.remarkPlugins || []),
        [remarkScopedPath, { mappings: REMARK_MAPPINGS, logLevel: LogLevel.Silent }],
        [remarkCodeSections, { logLevel: LogLevel.Silent }],
    ];

    return [pluginName, config];
}

function dumpRoutes() {
    return {
        name: 'dump-routes',
        async allContentLoaded({allContent, actions}: any) {
            const fs = require('node:fs');

            // route list (most stable in v3)
            const routes = actions.routesPaths ?? actions.routePaths ?? [];

            // optional: also dump plugin content ids so you can correlate routes
            fs.writeFileSync(
                'routes.json',
                JSON.stringify({routes, allContent}, null, 2),
            );
        },
    };
}

function assertNoDocsPrefix() {
    return (tree: any, file: any) => {
        const p = String(file.path || '');
        const {visit} = require('unist-util-visit');

        visit(tree, 'link', (node: any) => {
            if (typeof node.url === 'string' && node.url.startsWith('/docs/')) {
                console.log(`[assertNoDocsPrefix] ${p} url=${node.url}`);
            }
        });

        visit(tree, 'jsx', (node: any) => {
            if (typeof node.value === 'string' && node.value.includes('"/docs/')) {
                console.log(`[assertNoDocsPrefix] ${p} jsx contains "/docs/`);
            }
        });
    };
}


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

    // Even if you don't use internationalization, you can use this field to set
    // useful metadata like html lang. For example, if your site is Chinese, you
    // may want to replace "en" with "zh-Hans".
    i18n: {
        defaultLocale: 'en',
        locales: ['en'],
    },
    markdown: {
        hooks: {
            onBrokenMarkdownLinks: "throw"
        },
        mermaid: true,
    },
    staticDirectories: [
        'static',
        '_remotes/frontdoor/docusaurus/static/',
        '_remotes/selfhosted/docusaurus/static/',
        '_remotes/openziti/docusaurus/static/',
        '_remotes/zlan/docusaurus/static/',
        '_remotes/platform/docusaurus/static/',
        `${zrokRoot}/static/`,
        `${zrokRoot}/docs/images`
    ],
    customFields: {
        DOCUSAURUS_BASE_PATH: docsBase,
        DOCUSAURUS_DOCS_PATH: docsBase,
        OPENZITI_DOCS_BASE: `${docsBase}openziti`,
        UNIFIED_DOC_PATH: true,
        ALGOLIA_APPID: cfg.algolia.appId,
        ALGOLIA_APIKEY: cfg.algolia.apiKey,
        ALGOLIA_INDEXNAME: cfg.algolia.indexName,
    },
    themes: [
        ['@docusaurus/theme-classic', {
            customCss: [
                require.resolve('./src/css/custom.css'),
                require.resolve('@netfoundry/docusaurus-theme/css/product-picker.css'),
            ],
        }],
        '@netfoundry/docusaurus-theme',
        '@docusaurus/theme-mermaid',
        '@docusaurus/theme-search-algolia',
    ],
    plugins: [
        function emitDocsBase() {
            return {
                name: 'emit-docs-base',
                async loadContent() {
                    const fs = require('fs');
                    const dir = path.resolve(__dirname, 'src/generated');
                    if (!fs.existsSync(dir)) fs.mkdirSync(dir, {recursive: true});
                    const outPath = path.resolve(dir, 'docsBase.ts');
                    const docsLinkBase = `${docsBase}${isVercel ? 'docs/' : ''}`;
                    const content = `// auto-generated — do not commit\nexport const DOCS_BASE = '${docsLinkBase}';\n`;
                    fs.writeFileSync(outPath, content);
                    console.log(`\n✅  [emit-docs-base] wrote DOCS_BASE='${docsLinkBase}' → ${outPath}\n`);
                },
            };
        },
        '@docusaurus/plugin-debug',
        function webpackAliases() {
            return {
                name: 'unified-doc-webpack-aliases',
                configureWebpack(config:any, isServer:any) {
                    return {
                        resolve: {
                            alias: {
                                '@openziti': path.resolve(__dirname, `${openziti}/docusaurus`),
                                '@frontdoor': path.resolve(__dirname, `${frontdoor}/docusaurus`),
                                '@selfhosted': path.resolve(__dirname, `${selfhosted}/docusaurus`),
                                '@zlan': path.resolve(__dirname, `${zlan}/docusaurus`),
                                '@zrok': path.resolve(__dirname, `${zrokRoot}`),
                                '@zrokroot': path.resolve(__dirname, `${zrokRoot}`),
                                '@staticdir': path.resolve(__dirname, `docusaurus/static`),
                                '@platform': path.resolve(__dirname, `${platform}/docusaurus`),
                            },
                        },
                        module: {
                            rules: [
                                {
                                    test: /\.ya?ml$/,
                                    use: 'yaml-loader',
                                },
                            ],
                        },
                    };
                },
            };
        },

        ['@docusaurus/plugin-content-pages',{path: 'src/pages',routeBasePath: '/'}],
        build(BUILD_FLAGS.FRONTDOOR) && ['@docusaurus/plugin-content-pages',{id: `frontdoor-pages`, path: `${frontdoor}/docusaurus/src/pages`, routeBasePath: `/${routeBase('frontdoor')}`}],
        build(BUILD_FLAGS.SELFHOSTED) && ['@docusaurus/plugin-content-pages',{id: `selfhosted-pages`, path: `${selfhosted}/docusaurus/src/pages`, routeBasePath: `/${routeBase('selfhosted')}`}],
        build(BUILD_FLAGS.OPENZITI) && ['@docusaurus/plugin-content-pages',{id: `openziti-pages`, path: `${openziti}/docusaurus/src/pages`, routeBasePath: `/${routeBase('openziti')}`}],
        build(BUILD_FLAGS.ZLAN) && ['@docusaurus/plugin-content-pages',{id: `zlan-pages`, path: `${zlan}/docusaurus/src/pages`, routeBasePath: `/${routeBase('zlan')}`}],
        build(BUILD_FLAGS.ZROK) && ['@docusaurus/plugin-content-pages',{id: `zrok-pages`, path: `${zrokRoot}/src/pages`, routeBasePath: `/${routeBase('zrok')}`}],
        build(BUILD_FLAGS.PLATFORM) && ['@docusaurus/plugin-content-pages',{id: `platform-pages`, path: `${platform}/docusaurus/src/pages`, routeBasePath: `/${routeBase('platform')}`}],
        build(BUILD_FLAGS.ZROK) && extendDocsPlugins(zrokDocsPluginConfig(zrokRoot, REMARK_MAPPINGS, routeBase('zrok'))),
        build(BUILD_FLAGS.SELFHOSTED) && [
            '@docusaurus/plugin-content-docs',
            {
                id: 'selfhosted',
                path: `${selfhosted}/docusaurus/docs`,
                routeBasePath: routeBase('selfhosted'),
                sidebarPath: `${selfhosted}/docusaurus/sidebars.ts`,
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
                id: 'frontdoor', // do not change - affects algolia search
                path: `${frontdoor}/docusaurus/docs`,
                routeBasePath: routeBase('frontdoor'),
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
                id: 'openziti', // do not change - affects algolia search
                path: `${openziti}/docusaurus/docs`,
                routeBasePath: routeBase('openziti'),
                sidebarPath: `${openziti}/docusaurus/sidebars.ts`,
                includeCurrentVersion: true,
                beforeDefaultRemarkPlugins: [
                    remarkGithubAdmonitionsToDirectives,
                ],
                remarkPlugins: [
                    [remarkReplaceMetaUrl, {from: '@staticoz', to: `${docsBase}openziti`, logLevel: LogLevel.Silent}],
                    [remarkScopedPath, { mappings: REMARK_MAPPINGS, logLevel: LogLevel.Silent }],
                    [remarkCodeSections, { logLevel: LogLevel.Debug }],
                ],
            },
        ],
        build(BUILD_FLAGS.ZLAN) && [
            '@docusaurus/plugin-content-docs',
            {
                id: 'zlan', // do not change - affects algolia search
                path: `${zlan}/docusaurus/docs`,
                routeBasePath: routeBase('zlan'),
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
        build(BUILD_FLAGS.PLATFORM) && platformDocsPluginConfig(
            `${platform}/docusaurus`,
            REMARK_MAPPINGS,
            routeBase('platform'),
        ),
        ['@docusaurus/plugin-sitemap', { changefreq: "daily", priority: 0.8 }],
        [pluginHotjar, {}],
        [pluginReo, {}],
        ['@docusaurus/plugin-google-tag-manager', {id: `openziti-gtm`, containerId: cfg.google.tag}],
        build(BUILD_FLAGS.SELFHOSTED) && onpremRedirects(routeBase('selfhosted')),
        build(BUILD_FLAGS.ZROK) && zrokRedirects(routeBase('zrok')),
    ].filter(Boolean),
    themeConfig: {
        netfoundry: {
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
                { href: 'https://github.com/openziti/ziti', title: 'GitHub', iconName: 'github', pathPrefixes: ['/docs/openziti'] },
                { href: 'https://github.com/openziti/zrok', title: 'GitHub', iconName: 'github', pathPrefixes: ['/docs/zrok']     },
                { href: 'https://openziti.discourse.group/', title: 'Discourse', iconName: 'discourse' },
            ],
            productPickerColumns: [
                {
                    header: 'Managed Cloud',
                    links: [
                        {
                            label: 'NetFoundry Console',
                            to: '/docs/platform/intro',
                            logo: 'https://raw.githubusercontent.com/netfoundry/branding/refs/heads/main/images/svg/icon/netfoundry-icon-color.svg',
                            description: 'Cloud-managed orchestration and global fabric control.',
                        },
                        {
                            label: 'Frontdoor',
                            to: '/docs/frontdoor/intro',
                            logo: 'https://netfoundry.io/docs/img/frontdoor-sm-logo.svg',
                            description: 'Secure application access gateway.',
                        },
                    ],
                },
                {
                    header: 'Open Source',
                    links: [
                        {
                            label: 'OpenZiti',
                            to: '/docs/openziti/learn/introduction',
                            logo: 'https://netfoundry.io/docs/img/openziti-sm-logo.svg',
                            description: 'Programmable zero-trust mesh infrastructure.',
                        },
                        {
                            label: 'zrok',
                            to: '/docs/zrok/get-started',
                            logo: 'https://netfoundry.io/docs/img/zrok-1.0.0-rocket-purple.svg',
                            logoDark: 'https://netfoundry.io/docs/img/zrok-1.0.0-rocket-green.svg',
                            description: 'Secure peer-to-peer sharing built on OpenZiti.',
                        },
                    ],
                },
                {
                    header: 'Your own infrastructure',
                    links: [
                        {
                            label: 'Self-Hosted',
                            to: '/docs/selfhosted/intro',
                            logo: 'https://netfoundry.io/docs/img/onprem-sm-logo.svg',
                            description: 'Deploy the full stack in your own environment.',
                        },
                        {
                            label: 'zLAN',
                            to: '/docs/zlan/intro',
                            logo: 'https://netfoundry.io/docs/img/zlan/zlan-logo.svg',
                            description: 'Zero-trust access for OT networks.',
                        },
                    ],
                },
            ],
        },
        navbar: {
            hideOnScroll: false,
            title: '',
            items: [
                { type: 'custom-productPicker',   position: 'left', label: 'Products' },
                { type: 'custom-versionDropdown',  position: 'left', docsPluginId: 'zrok', pathPrefix: '/docs/zrok' },
                { type: 'custom-resourcesPicker', position: 'left' },
                { type: 'custom-iconLinks',        position: 'right' },
            ],
        },
        mermaid: {
            theme: {light: 'neutral', dark: 'forest'},
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
            searchParameters: {
                typoTolerance: "min",
                hitsPerPage: 25,
                attributesToRetrieve: ["content", "hierarchy", "url"],
                attributesToHighlight: ["content", "hierarchy"],
                restrictSearchableAttributes: ["content", "hierarchy"]
            },
            searchPagePath: 'search'
        },
        hotjar: {
            applicationId: cfg.hotjar.id
        },
        reo: {
            clientId: cfg.reo.clientId
        },
    } satisfies Preset.ThemeConfig,
    presets: [
        [  'redocusaurus',
            {
                specs: [
                    ...frontdoorRedocSpecs(`${frontdoor}/docusaurus`),
                    ...platformRedocSpecs(`${platform}/docusaurus`),
                    ...openzitiRedocSpecs(),
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
