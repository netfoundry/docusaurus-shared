import ProductsMegaMenu from './types/ProductsMegaMenu';

// @theme-original resolves to OUR OWN file in a plugin theme (Docusaurus sets
// both @theme and @theme-original to the plugin file). @theme-init resolves to
// the version from the upstream theme (theme-classic) — which is what we want.
// require() (not import) prevents webpack from hoisting this into the ESM init
// order, which would cause "__WEBPACK_DEFAULT_EXPORT__ before initialization".
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ComponentTypesOrig = require('@theme-init/NavbarItem/ComponentTypes').default as Record<string, any>;

export default {
  ...ComponentTypesOrig,
  'custom-productsMegaMenu': ProductsMegaMenu,
};
