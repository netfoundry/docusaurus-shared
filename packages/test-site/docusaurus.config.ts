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
        indexName: 'netfoundry.io_UWUTF7ESUI',
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

    // Register the NetFoundry theme (local path for development)
    themes: [
        path.resolve(__dirname, '../docusaurus-theme'),
    ],

    staticDirectories: [
        'static',
        `${frontdoor}/docusaurus/static`,
        `${onprem}/docusaurus/static`,
        `${openziti}/docusaurus/static`,
        `${zlan}/docusaurus/static`,
        `${zrokRoot}/static`,
    ],

    plugins: [
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

    presets: [
        ['classic', {
            docs: {
                routeBasePath: '/docs',
                sidebarPath: './sidebars.ts'
            },
            blog: false,
            theme: {
                customCss: [
                    require.resolve('./src/custom/custom.css'),
                    require.resolve('../docusaurus-theme/css/mega-menu.css'),
                ],
            }
        }
    ]
    ],

    themeConfig: {
        // NetFoundry theme configuration
        netfoundry: {
            showStarBanner: true,
            starBanner: {
                repoUrl: 'https://github.com/openziti/ziti',
                label: 'Star OpenZiti on GitHub',
            },
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
            title: 'NetFoundry Documentation',
            logo: {
                alt: 'NetFoundry Logo',
                src: 'https://raw.githubusercontent.com/netfoundry/branding/refs/heads/main/images/svg/icon/netfoundry-icon-color.svg',
            },
            items: [
                {
                    type: 'dropdown',
                    label: 'Products',
                    position: 'left',
                    className: 'nf-mega-dropdown',
                    items: [
                        {
                            type: 'html',
                            value: `
                              <div class="mega-menu-content">
                                <div class="mega-column">
                                  <span class="mega-header mega-header--managed">Managed Cloud</span>
                                  <a class="mega-link" href="#"><img src="https://raw.githubusercontent.com/netfoundry/branding/refs/heads/main/images/svg/icon/netfoundry-icon-color.svg" class="mega-logo"><div class="mega-text"><strong>NetFoundry Console</strong><span>Cloud-managed orchestration and global fabric control.</span></div></a>
                                  <a class="mega-link" href="/docs/frontdoor"><img src="https://raw.githubusercontent.com/netfoundry/branding/refs/heads/main/images/svg/icon/netfoundry-icon-color.svg" class="mega-logo"><div class="mega-text"><strong>Frontdoor</strong><span>Secure application access gateway.</span></div></a>
                                </div>
                                <div class="mega-column">
                                  <span class="mega-header mega-header--opensource">Open Source</span>
                                  <a class="mega-link" href="/docs/openziti"><div class="mega-text"><strong>OpenZiti</strong><span>Programmable zero-trust mesh infrastructure.</span></div></a>
                                  <a class="mega-link" href="/docs/zrok"><div class="mega-text"><strong>zrok</strong><span>Secure peer-to-peer sharing built on OpenZiti.</span></div></a>
                                </div>
                                <div class="mega-column">
                                  <span class="mega-header mega-header--infra">Your own infrastructure</span>
                                  <a class="mega-link" href="/docs/onprem"><div class="mega-text"><strong>Self-Hosted</strong><span>Deploy the full stack in your own environment.</span></div></a>
                                  <a class="mega-link" href="/docs/zlan"><div class="mega-text"><strong>zLAN</strong><span>Zero-trust access for OT networks.</span></div></a>
                                </div>
                              </div>`,
                        },
                    ],
                },
                {
                    to: '/docs',
                    label: 'Main Docs',
                    position: 'left',
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
