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
            includeCurrentVersion: true,
        } as any,
    ];
}
