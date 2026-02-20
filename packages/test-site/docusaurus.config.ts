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
  // Inline script in <head>: on first visit (no stored preference) detect OS
  // colour scheme and write it to localStorage before React hydrates.
  // This gives the correct initial theme without the "system" toggle button.
  headTags: [
    {
      tagName: 'script',
      attributes: {},
      innerHTML: `(function(){try{if(!localStorage.getItem('theme')){var dark=window.matchMedia('(prefers-color-scheme: dark)').matches;var t=dark?'dark':'light';document.documentElement.setAttribute('data-theme',t);localStorage.setItem('theme',t);}}catch(e){}})();`,
    },
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
              // Allow importing from the workspace root node_modules (yarn workspace hoisting)
              modules: [
                path.resolve(__dirname, '../../node_modules'),
                'node_modules',
              ],
            },
          };
        },
      };
    },
    openzitiDocsPluginConfig(`${openziti}/docusaurus`, REMARK_MAPPINGS, 'docs/openziti', 'openzitiSidebar'),
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
    colorMode: {
      defaultMode: 'dark',   // fallback if OS pref undetectable
      disableSwitch: false,
      respectPrefersColorScheme: false,  // false = only light/dark toggle (no "system" button)
    },
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
        resourceLinks: [
          {href: 'https://netfoundry.io/', label: 'NetFoundry'},
          {href: 'https://netfoundry.io/blog/', label: 'NetFoundry Tech Blog'},
          {href: 'https://blog.openziti.io', label: 'OpenZiti Tech Blog'},
        ],
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
                    <span class="mega-header mega-header--managed">Managed Cloud</span>
                    <a class="mega-link" href="#"><img src="/img/netfoundry-icon-color.svg" alt="NetFoundry Console" class="mega-logo"><div class="mega-text"><strong>NetFoundry Console</strong><span>Cloud-managed orchestration and global fabric control.</span></div></a>
                    <a class="mega-link" href="/docs/frontdoor"><img src="/img/frontdoor-sm-logo.svg" alt="Frontdoor" class="mega-logo"><div class="mega-text"><strong>Frontdoor</strong><span>Secure application access gateway without a legacy VPN.</span></div></a>
                  </div>
                  <div class="mega-column">
                    <span class="mega-header mega-header--opensource">Open Source</span>
                    <a class="mega-link" href="/docs/openziti"><img src="/img/openziti-sm-logo.svg" alt="OpenZiti" class="mega-logo"><div class="mega-text"><strong>OpenZiti</strong><span>Programmable zero-trust mesh infrastructure for any app.</span></div></a>
                    <a class="mega-link" href="/docs/zrok"><img src="/img/zrok-logo.svg" alt="zrok" class="mega-logo"><div class="mega-text"><strong>zrok</strong><span>Secure peer-to-peer sharing built on the OpenZiti mesh.</span></div></a>
                  </div>
                  <div class="mega-column">
                    <span class="mega-header mega-header--infra">Your infrastructure</span>
                    <a class="mega-link" href="#"><img src="/img/onprem-sm-logo.svg" alt="NetFoundry Self-Hosted" class="mega-logo"><div class="mega-text"><strong>NetFoundry Self-Hosted</strong><span>Private managed stack deployment for environment sovereignty.</span></div></a>
                    <a class="mega-link" href="/docs/zlan"><img src="/img/zlan-logo.svg" alt="zLAN" class="mega-logo"><div class="mega-text"><strong>zLAN</strong><span>Extend secure local network segments to the cloud edge.</span></div></a>
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
                      <svg class="mega-logo" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="#e2e8f0" stroke="#64748b" stroke-width="1.5"/><polyline points="14 2 14 8 20 8" stroke="#64748b" stroke-width="1.5"/><line x1="8" y1="13" x2="16" y2="13" stroke="#64748b" stroke-width="1.5" stroke-linecap="round"/><line x1="8" y1="17" x2="13" y2="17" stroke="#64748b" stroke-width="1.5" stroke-linecap="round"/></svg>
                      <div class="mega-text"><strong>NetFoundry Blog</strong><span>Latest news, updates, and insights from NetFoundry.</span></div>
                    </a>
                    <a class="mega-link" href="https://blog.openziti.io/" target="_blank" rel="noopener noreferrer">
                      <svg class="mega-logo" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="#e2e8f0" stroke="#64748b" stroke-width="1.5"/><polyline points="14 2 14 8 20 8" stroke="#64748b" stroke-width="1.5"/><line x1="8" y1="13" x2="16" y2="13" stroke="#64748b" stroke-width="1.5" stroke-linecap="round"/><line x1="8" y1="17" x2="13" y2="17" stroke="#64748b" stroke-width="1.5" stroke-linecap="round"/></svg>
                      <div class="mega-text"><strong>OpenZiti Blog</strong><span>Technical articles and community updates.</span></div>
                    </a>
                  </div>
                  <div class="mega-column">
                    <span class="mega-header">Community & Support</span>
                    <a class="mega-link" href="https://www.youtube.com/c/NetFoundry" target="_blank" rel="noopener noreferrer">
                      <svg class="mega-logo" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.97C18.88 4 12 4 12 4s-6.88 0-8.59.45A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.45a2.78 2.78 0 0 0 1.95-1.97A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" fill="#ff0000"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white"/></svg>
                      <div class="mega-text"><strong>NetFoundry YouTube</strong><span>Video tutorials, demos, and technical deep dives.</span></div>
                    </a>
                    <a class="mega-link" href="https://openziti.discourse.group/" target="_blank" rel="noopener noreferrer">
                      <svg class="mega-logo" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" fill="#ffedd5" stroke="#f97316" stroke-width="1.5"/></svg>
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