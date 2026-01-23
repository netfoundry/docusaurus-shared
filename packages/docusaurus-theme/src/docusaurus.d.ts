// Type declarations for Docusaurus runtime aliases
// These modules are resolved by Docusaurus at runtime

declare module '@docusaurus/useBaseUrl' {
  export default function useBaseUrl(url: string, options?: { absolute?: boolean }): string;
}

declare module '@docusaurus/Head' {
  import type { ReactNode } from 'react';
  interface Props {
    children?: ReactNode;
  }
  const Head: React.ComponentType<Props>;
  export default Head;
}

declare module '@docusaurus/ErrorBoundary' {
  import type { ReactNode } from 'react';
  interface Props {
    children: ReactNode;
    fallback?: React.ComponentType<{ error: Error; tryAgain: () => void }>;
  }
  const ErrorBoundary: React.ComponentType<Props>;
  export default ErrorBoundary;
}

declare module '@docusaurus/useDocusaurusContext' {
  interface DocusaurusContext {
    siteConfig: {
      title: string;
      tagline?: string;
      url: string;
      baseUrl: string;
      favicon?: string;
      themeConfig?: Record<string, unknown>;
      customFields?: Record<string, unknown>;
      [key: string]: unknown;
    };
    siteMetadata: {
      docusaurusVersion: string;
    };
    globalData: Record<string, unknown>;
    i18n: {
      currentLocale: string;
      locales: string[];
      defaultLocale: string;
    };
  }
  export default function useDocusaurusContext(): DocusaurusContext;
}

declare module '@theme/SkipToContent' {
  const SkipToContent: React.ComponentType;
  export default SkipToContent;
}

declare module '@theme/AnnouncementBar' {
  const AnnouncementBar: React.ComponentType;
  export default AnnouncementBar;
}

declare module '@theme/Navbar' {
  const Navbar: React.ComponentType;
  export default Navbar;
}

declare module '@theme/Layout/Provider' {
  import type { ReactNode } from 'react';
  interface Props {
    children: ReactNode;
  }
  const LayoutProvider: React.ComponentType<Props>;
  export default LayoutProvider;
}

declare module '@theme/ErrorPageContent' {
  interface Props {
    error: Error;
    tryAgain: () => void;
  }
  const ErrorPageContent: React.ComponentType<Props>;
  export default ErrorPageContent;
}

declare module '@theme/Tabs' {
  import type { ReactNode } from 'react';
  interface TabItemProps {
    value: string;
    label?: string;
    default?: boolean;
    children: ReactNode;
  }
  interface TabsProps {
    children: ReactNode;
    groupId?: string;
    defaultValue?: string;
    values?: Array<{ value: string; label: string }>;
  }
  export const TabItem: React.ComponentType<TabItemProps>;
  const Tabs: React.ComponentType<TabsProps>;
  export default Tabs;
}

// react-github-btn has type compatibility issues with React 18/19
declare module 'react-github-btn' {
  import type { ComponentType } from 'react';
  interface ReactGitHubButtonProps {
    href: string;
    'data-icon'?: string;
    'data-size'?: string;
    'data-show-count'?: string;
    'aria-label'?: string;
    children?: React.ReactNode;
  }
  const GitHubButton: ComponentType<ReactGitHubButtonProps>;
  export default GitHubButton;
}
