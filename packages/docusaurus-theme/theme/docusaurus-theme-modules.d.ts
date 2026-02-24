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
