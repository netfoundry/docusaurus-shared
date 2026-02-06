import * as path from 'path';
import type { PluginConfig } from '@docusaurus/types';

export function zlanDocsPluginConfig(
    rootDir: string,
    linkMappings: { from: string; to: string }[],
    routeBasePath: string = 'docs/zlan'
): PluginConfig {
    const docsPath = path.resolve(rootDir, 'docs');
    const sidebarPath = path.resolve(rootDir, 'sidebars.ts');
    return [
        '@docusaurus/plugin-content-docs',
        {
            id: 'zlan',
            path: docsPath,
            routeBasePath,
            sidebarPath,
            includeCurrentVersion: true,
        } as any,
    ];
}
