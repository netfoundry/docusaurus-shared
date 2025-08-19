import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import remarkScopedPath from './src/plugins/remark/remark-scoped-path';
const path = require('path');


const docsBase = process.env.DEPLOY_ENV === 'kinsta' ? '' : '/docs'
function docUrl(path:string): string {
  return docsBase + path;
}

const config: Config = {
  title: 'Shared Component Testing',
  tagline: 'Dinosaurs are cool',
  favicon: 'img/favicon.ico',

  future: { v4: true },

  url: 'https://your-docusaurus-site.example.com',
  baseUrl: '/',
  organizationName: 'netfoundry',
  projectName: 'docusaurus-shared',

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: docsBase,
          beforeDefaultRemarkPlugins: [
            [
              remarkScopedPath,
              {
                debug: true,
                mappings: [
                  { from: '@openzitidocs', to: docsBase },
                ],
              },
            ],
          ],
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      },
    ],
    // Redocusaurus config
    [
      'redocusaurus',
      {
        // Plugin Options for loading OpenAPI files
        specs: [
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
        },
      },
    ],
  ],

  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'openziti',
        path: '_remotes/ziti-doc/docusaurus/docs',
        routeBasePath: 'docs/openziti',
        sidebarPath: require.resolve('./_remotes/ziti-doc/docusaurus/sidebars.ts'),
        editUrl:
            'https://github.com/netfoundry/docusaurus-shared/tree/main/packages/create-docusaurus/templates/shared/',
        beforeDefaultRemarkPlugins: [
          [
            remarkScopedPath,
            {
              debug: true,
              mappings: [
                { from: '@openzitidocs', to: docsBase },
              ],
            },
          ],
        ],
      },
    ],
    // [
    //   '@docusaurus/plugin-content-pages',
    //   {
    //     id: 'openziti-pages',
    //     path: '_remotes/ziti-doc/docusaurus/src/pages',
    //     routeBasePath: '/docs/openziti'
    //   }
    // ],
  ],

  staticDirectories: [
    'static',
    '_remotes/ziti-doc/docusaurus/static',
    '_remotes/ziti-doc/docusaurus/public',
  ],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'NetFoundry Docs',
      logo: {
        alt: 'My Site Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          href: 'https://github.com/netfoundry/docusaurus-shared',
          label: 'GitHub',
          position: 'right',
        },
        {
          label: 'Products',
          position: 'left',
          items: [
            { label: 'OpenZiti', to: 'docs/openziti/learn/introduction/' },
            { label: 'Other Docs', to: '/docs/intro' },
          ]
        }
      ],
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  },
};

export default config;
