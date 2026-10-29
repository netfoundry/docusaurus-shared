// The test-site pages to screenshot. The test-site keeps one demo per page, so a failing screenshot points at one
// feature. Add a page here when you add a demo page to packages/test-site/docs/. Versioned copies (beta/, eol/) and
// the remote product fixtures repeat layouts already covered here, so only one of each is listed.

export interface VrtPage {
  // Stable, filesystem-safe id used as the screenshot base name.
  id: string;
  // Route path relative to the served site root (baseURL). Must start with "/".
  path: string;
  // Capture the whole scrollable page (default) or just the viewport. Set false for pages whose total height is
  // non-deterministic, where a fullPage capture can never match.
  fullPage?: boolean;
}

export const PAGES: VrtPage[] = [
  { id: "landing", path: "/" },
  { id: "docs-index", path: "/docs/" },
  { id: "intro", path: "/docs/intro" },
  { id: "not-found", path: "/__vrt_404_probe__" },

  { id: "markdown-typography", path: "/docs/markdown/typography" },
  { id: "markdown-code-blocks", path: "/docs/markdown/code-blocks" },
  { id: "markdown-admonitions", path: "/docs/markdown/admonitions" },
  { id: "markdown-tables", path: "/docs/markdown/tables" },
  { id: "markdown-task-lists", path: "/docs/markdown/task-lists" },
  { id: "markdown-cross-references", path: "/docs/markdown/cross-references" },

  { id: "code-theme-bash", path: "/docs/code-theme/bash" },
  { id: "code-theme-config", path: "/docs/code-theme/config" },
  { id: "code-theme-go", path: "/docs/code-theme/go" },
  { id: "code-theme-java-csharp", path: "/docs/code-theme/java-csharp" },
  { id: "code-theme-js-ts", path: "/docs/code-theme/js-ts" },
  { id: "code-theme-python", path: "/docs/code-theme/python" },

  { id: "components-custom", path: "/docs/components/custom-components" },
  { id: "components-navbar-items", path: "/docs/components/navbar-items" },
  { id: "components-os-tabs", path: "/docs/components/os-tabs" },
  { id: "components-product-search", path: "/docs/components/product-search" },
  { id: "components-tab-groups", path: "/docs/components/tab-groups" },

  { id: "media-asciinema", path: "/docs/media/asciinema" },
  { id: "media-charts", path: "/docs/media/charts" },
  { id: "media-images", path: "/docs/media/images" },
  { id: "media-math", path: "/docs/media/math" },
  { id: "media-mermaid", path: "/docs/media/mermaid" },
  { id: "media-video-player", path: "/docs/media/video-player" },

  { id: "plugins-code-sections", path: "/docs/plugins/code-sections" },
  { id: "plugins-github-admonitions", path: "/docs/plugins/github-admonitions" },
  // Scalar renders a different amount of content per run.
  { id: "plugins-openapi-scalar", path: "/docs/plugins/openapi-scalar", fullPage: false },
  { id: "plugins-replace-meta-url", path: "/docs/plugins/replace-meta-url" },
  { id: "plugins-scoped-paths", path: "/docs/plugins/scoped-paths" },
  { id: "plugins-yaml-tables", path: "/docs/plugins/yaml-tables" },
  { id: "plugins-youtube-embed", path: "/docs/plugins/youtube-embed" },

  { id: "reference-frontmatter-knobs", path: "/docs/reference/frontmatter-knobs" },
  { id: "reference-importing-markdown", path: "/docs/reference/importing-markdown" },
  { id: "reference-long-page", path: "/docs/reference/long-page" },
  { id: "deep-nested-page", path: "/docs/deep/nested/path/page" },

  { id: "versioned-beta-intro", path: "/docs/beta/intro" },
  { id: "remote-zrok-formatting-demo", path: "/docs/zrok/formatting-demo" },
  { id: "markdown-page", path: "/markdown-page" },
];
