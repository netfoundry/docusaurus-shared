/**
 * Type stubs for Docusaurus @theme/* virtual modules.
 * These are resolved at runtime by Docusaurus's webpack aliases and are not
 * available to the standalone TypeScript compiler. Declared as `any`-based
 * components here since all call sites cast them to ComponentType<any> anyway.
 */
declare module '@docusaurus/Link' {
  const Link: any;
  export default Link;
}

declare module '@theme-original/NavbarItem/ComponentTypes' {
  const ComponentTypes: any;
  export default ComponentTypes;
}

declare module '@theme-init/NavbarItem/ComponentTypes' {
  const ComponentTypes: any;
  export default ComponentTypes;
}

declare module '@theme/NavbarItem/NavbarNavLink' {
  import type React from 'react';
  const NavbarNavLink: React.ComponentType<any>;
  export default NavbarNavLink;
}

declare module '@theme/NavbarItem' {
  import type React from 'react';
  const NavbarItem: React.ComponentType<any>;
  export default NavbarItem;
}

declare module '@theme/SearchBar' {
  import type React from 'react';
  const SearchBar: React.ComponentType<any>;
  export default SearchBar;
}

declare module '@theme-init/Navbar/MobileSidebar/PrimaryMenu' {
  const PrimaryMenu: any;
  export default PrimaryMenu;
}

declare module '@docusaurus/plugin-content-docs/client' {
  export function useActivePlugin(options?: { failfast?: boolean }): { pluginId: string } | undefined;
  export function useActiveDocContext(pluginId: string): {
    activeDoc?: { path: string; id: string };
    alternateDocVersions: Record<string, { path: string; id: string }>;
  };
}
