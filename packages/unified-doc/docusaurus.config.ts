import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

import type {NavbarItem} from '@docusaurus/theme-common';
// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

import remarkGithubAdmonitionsToDirectives from "remark-github-admonitions-to-directives";


function docUrl2(path:string): string {
    return path;
}
const buildNavbarItems = (docUrl: (path: string) => string): NavbarItem[] => ([
    {
        type: 'html',
        value: '<a class="navbar__item navbar__link header-netfoundry-link" href="https://netfoundry.io/products/netfoundry-cloud-30-day-free-trial/" target="_blank">NetFoundry</a>',
        position: 'right'
    },
    {
        to: docUrl('/learn/introduction/'),
        label: 'Documentation',
        position: 'right',
        activeBaseRegex: docUrl('/(?!downloads)'),
    },
    {
        to: docUrl('/downloads'),
        label: 'Downloads',
        position: 'right',
        activeBaseRegex: docUrl('/downloads'),
    },
]);

const config: Config = {
    title: 'NetFoundry Docs',
    tagline: 'Spin Up a Network',
    favicon: 'https://raw.githubusercontent.com/netfoundry/branding/refs/heads/main/images/png/icon/netfoundry-icon-color.png',

    // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
    future: {
        v4: true, // Improve compatibility with the upcoming Docusaurus v4
    },

    // Set the production url of your site here
    url: 'https://netfoundry.io',
    baseUrl: '/',

    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'throw',

    i18n: {
        defaultLocale: 'en',
        locales: ['en'],
    },

    presets: [
        [
            'classic',
            {
                docs: {
                    routeBasePath: '/',
                    sidebarPath: './sidebars.ts',
                    showLastUpdateTime: true
                },
                theme: {
                    customCss: './src/css/custom.css',
                },
            } satisfies Preset.Options,
        ],
    ],

    themeConfig: {
        // Replace with your project's social card
        image: 'https://raw.githubusercontent.com/netfoundry/branding/refs/heads/main/images/svg/icon/netfoundry-icon-color.svg',
        navbar: {
            title: 'NetFoundry On-Prem',
            logo: {
                alt: 'NetFoundry Logo',
                src: 'https://raw.githubusercontent.com/netfoundry/branding/refs/heads/main/images/svg/icon/netfoundry-icon-color.svg',
            },
            items: buildNavbarItems(docUrl2),
            // items: [
            //     {
            //         type: 'docSidebar',
            //         sidebarId: 'tutorialSidebar',
            //         position: 'left',
            //         label: 'Documentation',
            //     },
            // ],
        },
        prism: {
            theme: prismThemes.github,
            darkTheme: prismThemes.dracula,
        },
        metadata: [
            {name: 'description', content: 'open source zero trust'},
            {name: 'robots', content: 'index, follow'},
        ],
    } satisfies Preset.ThemeConfig,
};

export default config;