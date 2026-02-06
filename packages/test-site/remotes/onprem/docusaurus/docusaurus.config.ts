import type { Config } from '@docusaurus/types';
import path from 'node:path';
import {themes as prismThemes} from 'prism-react-renderer';

// Standalone config for onprem sub-project
// When aggregated by test-site, the plugin file is used instead
export default {
    title: 'NetFoundry Self-Hosted Documentation',
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
            title: 'Self-Hosted Documentation',
        },
        prism: {
            theme: prismThemes.github,
            darkTheme: prismThemes.dracula,
        },
    },
} satisfies Config;
