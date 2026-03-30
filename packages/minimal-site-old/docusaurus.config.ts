import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import { themes as prismThemes } from 'prism-react-renderer';

export default {
    title: 'Minimal Site',
    url: 'http://localhost',
    baseUrl: '/',
    future: { v4: true },
    onBrokenLinks: 'warn' as const,
    i18n: {
        defaultLocale: 'en',
        locales: ['en'],
    },
    markdown: {
        mermaid: true,
    },
    customFields: {
        DOCUSAURUS_BASE_PATH: '/',
        UNIFIED_DOC_PATH: true,
    },

    themes: [
        ['@docusaurus/theme-classic', {
            customCss: [
                require.resolve('@netfoundry/docusaurus-theme/css/product-picker.css'),
                require.resolve('@netfoundry/docusaurus-theme/css/layout.css'),
                require.resolve('@netfoundry/docusaurus-theme/css/legacy.css'),
            ],
        }],
        '@netfoundry/docusaurus-theme',
        '@docusaurus/theme-mermaid',
        '@docusaurus/theme-search-algolia',
    ],

    presets: [
        ['redocusaurus', { specs: [] }],
    ],

    plugins: [
        '@docusaurus/plugin-debug',
        '@docusaurus/plugin-content-pages',
        ['@docusaurus/plugin-content-docs', { id: 'default', path: 'docs', routeBasePath: '/docs' }],
        function webpackAliases() {
            return {
                name: 'minimal-site-webpack-aliases',
                configureWebpack() {
                    return {
                        module: {
                            rules: [
                                { test: /\.ya?ml$/, use: 'yaml-loader' },
                            ],
                        },
                    };
                },
            };
        },
    ],

    themeConfig: {
        netfoundry: {
            productPickerColumns: [
                {
                    header: 'Products',
                    links: [
                        {
                            label: 'OpenZiti v7',
                            to: 'https://openziti.io',
                            logo: 'https://netfoundry.io/docs/img/openziti-sm-logo.svg',
                            description: 'Programmable zero-trust networking.',
                        },
                    ],
                },
            ],
            navbarIconLinks: [
                { href: 'https://github.com/openziti/ziti', title: 'GitHub', iconName: 'github' },
                { href: 'https://openziti.discourse.group/', title: 'Discourse', iconName: 'discourse' },
            ],
            resourcesPickerSections: [
                {
                    header: 'Learn',
                    links: [
                        {
                            label: 'OpenZiti Tech Blog v7',
                            description: 'Technical articles and community updates.',
                            href: 'https://blog.openziti.io/',
                            logoUrl: 'https://netfoundry.io/docs/img/openziti-sm-logo.svg',
                        },
                    ],
                },
            ],
        },
        navbar: {
            hideOnScroll: false,
            title: 'Minimal Site v7',
            items: [
                { type: 'custom-productPicker',   position: 'left',  label: 'Products' },
                { type: 'custom-iconLinks',        position: 'right' },
                { type: 'custom-resourcesPicker', position: 'right' },
            ],
        },
        mermaid: {
            theme: { light: 'neutral', dark: 'forest' },
        },
        algolia: {
            appId: 'placeholder',
            apiKey: 'placeholder',
            indexName: 'placeholder',
        },
        prism: {
            theme: prismThemes.github,
            darkTheme: prismThemes.dracula,
        },
    } satisfies Preset.ThemeConfig,
} satisfies Config;
