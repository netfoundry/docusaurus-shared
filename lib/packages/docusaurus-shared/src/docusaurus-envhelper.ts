import type { LoadContext, Plugin } from '@docusaurus/types';

// Safe in browser & Node: check globalThis.process only by property access on a known object.
// 1) Use Node's env if present; 2) else use browser-injected __DOCUSAURUS_ENV__; 3) else {}
type Env = Record<string, string | undefined>;
const g: any = typeof globalThis !== "undefined" ? globalThis : {};

const RUNTIME_ENV: Env = (() => {
    if (g.process && typeof g.process.env === "object") return g.process.env as Env;
    if (g.__DOCUSAURUS_ENV__) return g.__DOCUSAURUS_ENV__ as Env;
    return {};
})();

const getEnv = (k: string, d?: string) =>
    (RUNTIME_ENV[k] ?? d) as string | undefined;

const ORIGIN =
    getEnv("DOCUSAURUS_URL") ||
    (typeof window !== "undefined" ? window.location.origin : "http://localhost");

export const DOCUSAURUS_DEBUG = getEnv("DOCUSAURUS_DEBUG") === "true";
export const DOCUSAURUS_URL = ORIGIN;
export const DOCUSAURUS_BASE_PATH = getEnv("DOCUSAURUS_BASE_PATH", "/base-url");
export const DOCUSAURUS_DOCS_PATH = getEnv("DOCUSAURUS_DOCS_PATH", "/docs-path");
export const DOCUSAURUS_CANONICAL_DOMAIN = getEnv("DOCUSAURUS_CANONICAL_DOMAIN", "canonical.domain.missing.local");
export const hotjarId = getEnv("ZITI_HOTJAR_APPID", "6443327")!;

export function cleanUrl(path: string) {
    return path.replace(/([^:]\/)\/+/g, "$1");
}

export function docUrl(path: string): string {
    return cleanUrl(`${DOCUSAURUS_DOCS_PATH}/${path}`);
}

export function baseUrl(path: string): string {
    return cleanUrl(`${DOCUSAURUS_BASE_PATH}/${path}`);
}

export function absoluteUrl(path: string): string {
    return cleanUrl(`${DOCUSAURUS_BASE_PATH}/${DOCUSAURUS_DOCS_PATH}/${path}`);
}

export function absoluteOriginUrl(path: string): string {
    return cleanUrl(`${DOCUSAURUS_URL}${absoluteUrl(path)}`);
}

export function addDocsRedir(redirectsArr: { to: string; from: string[] }[]) {
    if (getEnv("DEPLOY_ENV") === "kinsta") {
        redirectsArr.push({
            to: docUrl("/learn/introduction/"),
            from: [docUrl("/docs")],
        });
    }
}





interface HotjarThemeConfig {
    applicationId: string;
}

export function pluginHotjar(context: LoadContext): Plugin {
    const { siteConfig } = context;
    const { themeConfig } = siteConfig;
    const { hotjar } = themeConfig as { hotjar?: HotjarThemeConfig };

    if (!hotjar) {
        throw new Error(
            `You need to specify 'hotjar' object in 'themeConfig' with 'applicationId' field in it to use docusaurus-plugin-hotjar`,
        );
    }

    const { applicationId } = hotjar;

    if (!applicationId) {
        throw new Error(
            'You specified the `hotjar` object in `themeConfig` but the `applicationId` field was missing. ' +
            'Please ensure this is not a mistake.',
        );
    }

    const isProd = process.env.NODE_ENV === 'production';

    return {
        name: 'docusaurus-plugin-hotjar',

        injectHtmlTags() {
            console.log(`[hotjar] applicationId = ${applicationId} isProd = ${isProd}`);
            if (!isProd) {
                return {};
            }

            return {
                headTags: [
                    {
                        tagName: 'script',
                        innerHTML: `(function(h,o,t,j,a,r){
  h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
  h._hjSettings={hjid:${applicationId},hjsv:6};
  a=o.getElementsByTagName('head')[0];
  r=o.createElement('script');r.async=1;
  r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
  a.appendChild(r);
})(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`,
                    },
                ],
            };
        },
    };
}
