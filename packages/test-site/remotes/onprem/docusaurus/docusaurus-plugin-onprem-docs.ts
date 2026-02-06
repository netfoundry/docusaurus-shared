import * as path from 'path';
import type { PluginConfig } from '@docusaurus/types';

export function onpremDocsPluginConfig(
    rootDir: string,
    linkMappings: { from: string; to: string }[],
    routeBasePath: string = 'docs/onprem'
): PluginConfig {
    const docsPath = path.resolve(rootDir, 'docs');
    const sidebarPath = path.resolve(rootDir, 'sidebars.ts');
    return [
        '@docusaurus/plugin-content-docs',
        {
            id: 'onprem',
            path: docsPath,
            routeBasePath,
            sidebarPath,
            includeCurrentVersion: true,
        } as any,
    ];
}
