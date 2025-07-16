import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import remarkScopedPath from './src/plugins/remark/remark-scoped-path';
const path = require('path');


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
        // beforeDefaultRemarkPlugins: [
        //   [
        //     remarkScopedPath,
        //     [
        //       { from: '@openzitidocs', to: '_remotes/ziti-doc/docusaurus/docs' },
        //       { from: '@openzitiimg',    to: '/img/openziti' },
        //       { from: '@openzitisite',   to: './_remotes/ziti-doc/docusaurus' },
        //     ],
        //   ],
        // ],
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
  ],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'My Site',
      logo: {
        alt: 'My Site Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'defaultSidebar',
          docId: 'intro',
          position: 'left',
          label: 'Tutorial',
        },
        {
          href: 'https://github.com/netfoundry/docusaurus-shared',
          label: 'GitHub',
          position: 'right',
        },
        {
          label: 'Docs',
          position: 'left',
          items: [
            { label: 'OpenZiti', to: '/docs/openziti' },
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
