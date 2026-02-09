import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import path from "node:path";
import { themes as prismThemes } from 'prism-react-renderer';
import { zrokDocsPluginConfig } from "./remotes/zrok/website/docusaurus-plugin-zrok-docs";
import { openzitiDocsPluginConfig } from "./remotes/openziti/docusaurus/docusaurus-plugin-openziti-docs";
import { frontdoorDocsPluginConfig } from "./remotes/frontdoor/docusaurus/docusaurus-plugin-frontdoor-docs";
import { onpremDocsPluginConfig } from "./remotes/onprem/docusaurus/docusaurus-plugin-onprem-docs";
import { zlanDocsPluginConfig } from "./remotes/zlan/docusaurus/docusaurus-plugin-zlan-docs";

const frontdoor = `./remotes/frontdoor`;
const onprem = `./remotes/onprem`;
const openziti = `./remotes/openziti`;
const zlan = `./remotes/zlan`;
const zrokRoot = `./remotes/zrok/website`;

const staging = {
  docusaurus: { url: 'https://netfoundry.io' },
  algolia: { appId: 'QRGW6TJXHP', apiKey: '267457291182a398c5ee19fcb0bcae77', indexName: 'nfdocs_stg' },
  hotjar: { id: "6443487" }
};

const prod = {
  docusaurus: { url: 'https://netfoundry.io' },
  algolia: { appId: 'UWUTF7ESUI', apiKey: '3a4a0691d0e8e3bb7c27c702c6a86ea9', indexName: 'netfoundry.io_UWUTF7ESUI' },
  hotjar: { id: "6506483" }
};

const cfg = process.env.DOCUSAURUS_PUBLISH_ENV == 'prod' ? prod : staging;
const REMARK_MAPPINGS = [];

const config: Config = {
  title: 'NetFoundry Docs',
  url: 'https://netfoundry.io',
  baseUrl: '/',
  themes: ['@netfoundry/docusaurus-theme'],
  staticDirectories: [
    'static',
    `${frontdoor}/docusaurus/static`,
    `${onprem}/docusaurus/static`,
    `${openziti}/docusaurus/static`,
    `${zlan}/docusaurus/static`,
    `${zrokRoot}/static`,
  ],
  plugins: [
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
              },
            },
          };
        },
      };
    },
    wopenzitiDocsPluginConfig(`${openziti}/docusaurus`, REMARK_MAPPINGS, 'docs/openziti', 'openzitiSidebar'),
    frontdoorDocsPluginConfig(`${frontdoor}/docusaurus`, REMARK_MAPPINGS, 'docs/frontdoor', 'frontdoorSidebar'),
    onpremDocsPluginConfig(`${onprem}/docusaurus`, REMARK_MAPPINGS, 'docs/onprem'),
    zlanDocsPluginConfig(`${zlan}/docusaurus`, REMARK_MAPPINGS, 'docs/zlan'),
    zrokDocsPluginConfig(zrokRoot, REMARK_MAPPINGS, 'docs/zrok'),
  ],
  presets: [
    ['classic', {
      docs: { routeBasePath: '/docs', sidebarPath: './sidebars.ts' },
      blog: false,
      theme: {
        customCss: [
          require.resolve('../docusaurus-theme/css/vars.css'),
          require.resolve('./src/custom/custom.css'),
        ],
      }
    }]
  ],
  themeConfig: {
    netfoundry: {
      showStarBanner: false, // Banner OFF
      starBanner: { repoUrl: 'https://github.com/openziti/ziti', label: 'Star OpenZiti on GitHub' },
      footer: {
        description: 'Secure, high-performance networking for the modern era.',
        copyright: `Copyright © 2026 NetFoundry Inc.`,
        socialProps: {
          githubUrl: 'https://github.com/netfoundry/',
          youtubeUrl: 'https://youtube.com/netfoundry/',
          linkedInUrl: 'https://www.linkedin.com/company/netfoundry/',
          twitterUrl: 'https://x.com/netfoundry/',
        },
      },
    },
    navbar: {
      title: 'NetFoundry Docs',
      logo: { alt: 'NetFoundry Logo', src: 'img/logo.svg', className: 'nf-navbar-logo' },
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
                    <span class="mega-header">Managed & Enterprise</span>
                    <a class="mega-link" href="#"><div class="mega-icon icon-console"></div><div class="mega-text"><strong>NetFoundry Console</strong><span>Cloud-managed orchestration and global fabric control.</span></div></a>
                    <a class="mega-link" href="#"><div class="mega-icon icon-server"></div><div class="mega-text"><strong>NetFoundry Self-Hosted</strong><span>Private managed stack deployment for environment sovereignty.</span></div></a>
                    <a class="mega-link" href="/docs/frontdoor"><div class="mega-icon icon-door"></div><div class="mega-text"><strong>Frontdoor</strong><span>Secure application access gateway without a legacy VPN.</span></div></a>
                  </div>
                  <div class="mega-column">
                    <span class="mega-header">Open Source & Core</span>
                    <a class="mega-link" href="/docs/zrok"><div class="mega-icon icon-share"></div><div class="mega-text"><strong>zrok</strong><span>Secure peer-to-peer sharing built on the OpenZiti mesh.</span></div></a>
                    <a class="mega-link" href="/docs/openziti"><div class="mega-icon icon-mesh"></div><div class="mega-text"><strong>OpenZiti</strong><span>Programmable zero-trust mesh infrastructure for any app.</span></div></a>
                    <a class="mega-link" href="/docs/zlan"><div class="mega-icon icon-network"></div><div class="mega-text"><strong>zLAN</strong><span>Extend secure local network segments to the cloud edge.</span></div></a>
                  </div>
                </div>`,
            },
          ],
        },
        {
          type: 'dropdown',
          label: 'Resources',
          position: 'left',
          className: 'nf-resources-dropdown',
          items: [
            {
              type: 'html',
              value: `
                <div class="mega-menu-content mega-menu-resources">
                  <div class="mega-column">
                    <span class="mega-header">Learn & Engage</span>
                    <a class="mega-link" href="https://netfoundry.io/blog/" target="_blank" rel="noopener noreferrer">
                      <div class="mega-icon icon-blog"></div>
                      <div class="mega-text"><strong>NetFoundry Blog</strong><span>Latest news, updates, and insights from NetFoundry.</span></div>
                    </a>
                    <a class="mega-link" href="https://blog.openziti.io/" target="_blank" rel="noopener noreferrer">
                      <div class="mega-icon icon-blog"></div>
                      <div class="mega-text"><strong>OpenZiti Blog</strong><span>Technical articles and community updates.</span></div>
                    </a>
                  </div>
                  <div class="mega-column">
                    <span class="mega-header">Community & Support</span>
                    <a class="mega-link" href="https://www.youtube.com/c/NetFoundry" target="_blank" rel="noopener noreferrer">
                      <div class="mega-icon icon-youtube"></div>
                      <div class="mega-text"><strong>NetFoundry YouTube</strong><span>Video tutorials, demos, and technical deep dives.</span></div>
                    </a>
                    <a class="mega-link" href="https://openziti.discourse.group/" target="_blank" rel="noopener noreferrer">
                      <div class="mega-icon icon-forum"></div>
                      <div class="mega-text"><strong>OpenZiti Discourse</strong><span>Ask questions and connect with the community.</span></div>
                    </a>
                  </div>
                </div>`,
            },
          ],
        },
        {
          href: 'https://github.com/openziti/ziti',
          position: 'right', // Relocated Star Badge
          className: 'navbar-github-stars',
          html: `
            <div class="gh-star-badge">
              <svg height="16" width="16" viewBox="0 0 16 16" class="gh-logo"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg>
              <div class="gh-star-separator"></div>
              <svg viewBox="0 0 16 16" width="14" height="14" class="gh-star-icon"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"></path></svg>
              <span class="gh-star-count">3,857</span>
            </div>
          `,
        },
      ],
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['python', 'bash', 'yaml'],
    },
    algolia: {
      appId: cfg.algolia.appId,
      apiKey: cfg.algolia.apiKey,
      indexName: cfg.algolia.indexName,
      contextualSearch: true,
    },
    hotjar: { applicationId: cfg.hotjar.id },
  },
};

export default config;