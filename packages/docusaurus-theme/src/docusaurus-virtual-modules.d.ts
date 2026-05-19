// These are Docusaurus virtual modules resolved by webpack at runtime.
// Declarations here let tsc compile theme/ files that import from them.

declare module '@docusaurus/router' {
    export function useLocation(): { pathname: string; search: string; hash: string; state: unknown };
    export function useHistory(): { push(path: string): void; replace(path: string): void; goBack(): void };
}

declare module '@theme/Layout' {
    import type { ReactNode } from 'react';
    export interface Props { children?: ReactNode }
    export default function Layout(props: Props): ReactNode;
}
