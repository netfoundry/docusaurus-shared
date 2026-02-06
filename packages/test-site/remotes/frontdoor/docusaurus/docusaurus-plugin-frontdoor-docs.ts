import * as path from 'path';
import type { PluginConfig } from '@docusaurus/types';

export function frontdoorDocsPluginConfig(
    rootDir: string,
    linkMappings: { from: string; to: string }[],
    routeBasePath: string = 'docs/frontdoor'
): PluginConfig {
    const docsPath = path.resolve(rootDir, 'docs');
    const sidebarPath = path.resolve(rootDir, 'sidebars.ts');
    return [
        '@docusaurus/plugin-content-docs',
        {
            id: 'frontdoor',
            path: docsPath,
            routeBasePath,
            sidebarPath,
            includeCurrentVersion: true,
        } as any,
    ];
}
