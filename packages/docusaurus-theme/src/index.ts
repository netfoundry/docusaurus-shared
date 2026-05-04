import type { LoadContext, Plugin } from '@docusaurus/types';
import type { NetFoundryThemeOptions } from './options';
import path from 'path';

export default function themeNetFoundry(
  context: LoadContext,
  options: NetFoundryThemeOptions = {}
): Plugin {
  return {
    name: '@netfoundry/docusaurus-theme',

    // Register theme component overrides
    getThemePath() {
      return path.resolve(__dirname, '../theme');
    },

    // For TypeScript development
    getTypeScriptThemePath() {
      return path.resolve(__dirname, '../theme');
    },

    // Automatically inject CSS
    getClientModules() {
      const modules: string[] = [
        // @docsearch/css is intentionally NOT listed here.
        // It is injected by @docusaurus/theme-search-algolia, which all
        // consuming sites are expected to register. Adding it here would
        // double-load it on sites with Algolia and load it unnecessarily
        // on sites without search.
        require.resolve('../css/theme.css'),
      ];

      // Add custom CSS if specified in options
      if (options.customCss) {
        const customCssArray = Array.isArray(options.customCss)
          ? options.customCss
          : [options.customCss];
        modules.push(...customCssArray);
      }

      return modules;
    },
  };
}

// Re-export types for consumers (types are safe to export at config time)
export type {
  NetFoundryThemeOptions,
  NetFoundryThemeConfig,
  ResourcesPickerSection,
  ResourcesPickerLink,
  NavbarIconLink,
  NavbarIconName,
} from './options';

// Product registry and pre-built picker column blocks. Consumer sites set
// `themeConfig.netfoundry.productPickerColumns` to one of:
//   - `unifiedPickerColumns`  (for the netfoundry.io/docs aggregator)
//   - `subsitePickerColumns`  (for standalone subsites)
// Or omit it entirely -- the picker falls back to `subsitePickerColumns`.
export {
  PRODUCTS,
  DOCS_BASE,
  // whole-array pre-builts
  subsitePickerColumns,
  unifiedPickerColumns,
  // per-product, relative /docs/<path>
  consoleLink,
  frontdoorLink,
  selfhostedLink,
  zlanLink,
  openzitiLink,
  zrokLink,
  // per-product, absolute https://netfoundry.io/docs/<path>
  consoleLinkAbs,
  frontdoorLinkAbs,
  selfhostedLinkAbs,
  zlanLinkAbs,
  openzitiLinkAbs,
  zrokLinkAbs,
} from './products';
export type { ProductId, Product, PickerColumn, PickerLink } from './products';

// NOTE: UI components (defaultNetFoundryFooterProps, defaultSocialProps, etc.)
// should be imported directly from '@netfoundry/docusaurus-shared/ui' in client code,
// not from this theme entry point, as this file runs at Node.js config time.
