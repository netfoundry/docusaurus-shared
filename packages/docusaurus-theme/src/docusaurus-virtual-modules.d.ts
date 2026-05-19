// @docusaurus/router is a Docusaurus virtual module resolved by webpack at
// runtime. This declaration lets tsc compile theme/ files that import from it.
declare module '@docusaurus/router' {
    export function useLocation(): { pathname: string; search: string; hash: string; state: unknown };
    export function useHistory(): { push(path: string): void; replace(path: string): void; goBack(): void };
}
