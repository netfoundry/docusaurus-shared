/*
This file is used to help sub-sites merge with the unified doc site
 */
export interface DocusaurusConfig {
    url: string;
}

export interface AlgoliaConfig {
    appId: string;
    apiKey: string;
    indexName: string;
}

export interface HotjarConfig {
    id: string;
}

export interface PublishConfig {
    docusaurus: DocusaurusConfig;
    algolia: AlgoliaConfig;
    hotjar: HotjarConfig;
}