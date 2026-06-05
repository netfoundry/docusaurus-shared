import * as path from 'path';
import type { PluginConfig } from '@docusaurus/types';

export function openzitiDocsPluginConfig(
    rootDir: string,
    linkMappings: { from: string; to: string }[],
    routeBasePath: string = 'docs/openziti'
): PluginConfig {
    const docsPath = path.resolve(rootDir, 'docs');
    const sidebarPath = path.resolve(rootDir, 'sidebars.ts');
    return [
        '@docusaurus/plugin-content-docs',
        {
            id: 'openziti',
            path: docsPath,
            routeBasePath,
            sidebarPath,
            lastVersion: 'current',
            includeCurrentVersion: true,
            versions: {
                'current':     { label: 'Active LTS (2.0.x)',      path: '',       banner: 'none'         },
                'latest':      { label: 'Latest',                  path: 'latest', banner: 'unreleased'   },
                'maintenance': { label: 'Maintenance LTS (1.6.x)', path: 'maint',  banner: 'unmaintained' },
            },
        } as any,
    ];
}
