import type { Config } from '@docusaurus/types';
import path from 'node:path';
import {themes as prismThemes} from 'prism-react-renderer';

// Standalone config for zlan sub-project
// When aggregated by test-site, the plugin file is used instead
export default {
    title: 'zLAN Documentation',
    url: 'https://netfoundry.io',
    baseUrl: '/',

    themes: [
        path.resolve(__dirname, '../../../../docusaurus-theme'),
    ],

    plugins: [],
    presets: [
        ['classic', {
            docs: {
                routeBasePath: '/docs',
                sidebarPath: './sidebars.ts',
            },
            blog: false,
            theme: {},
        }],
    ],

    themeConfig: {
        navbar: {
            title: 'zLAN Documentation',
        },
        prism: {
            theme: prismThemes.github,
            darkTheme: prismThemes.dracula,
        },
    },
} satisfies Config;
