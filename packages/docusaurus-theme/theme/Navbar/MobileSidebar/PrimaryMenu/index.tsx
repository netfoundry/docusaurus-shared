import React from 'react';
import SearchBar from '@theme/SearchBar';

// Plugin-theme swizzle (wrap): @theme-original would resolve to THIS file, so
// pull the upstream theme-classic PrimaryMenu via @theme-init -- same trick as
// theme/NavbarItem/ComponentTypes.tsx. require() (not import) avoids webpack
// hoisting this into the ESM init order.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PrimaryMenu = require('@theme-init/Navbar/MobileSidebar/PrimaryMenu').default as React.ComponentType<any>;

/**
 * Prepend the search box to the top of the mobile navbar sidebar. SearchBar is
 * otherwise only rendered in the top navbar, which isn't reachable once the
 * mobile menu is open.
 */
export default function PrimaryMenuWrapper(props: any) {
  return (
    <>
      <div className="navbar-sidebar__search">
        <SearchBar />
      </div>
      <PrimaryMenu {...props} />
    </>
  );
}
