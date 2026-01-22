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
export type { NetFoundryThemeOptions, NetFoundryThemeConfig } from './options';

// NOTE: UI components (defaultNetFoundryFooterProps, defaultSocialProps, etc.)
// should be imported directly from '@netfoundry/docusaurus-shared/ui' in client code,
// not from this theme entry point, as this file runs at Node.js config time.
