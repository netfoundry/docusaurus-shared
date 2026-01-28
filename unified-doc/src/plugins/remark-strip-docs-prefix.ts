/**
 * Remark plugin that strips /docs prefix from internal links.
 * Used when baseUrl is '/' (Vercel deployment) but content has hardcoded /docs/ links.
 */
import { visit } from 'unist-util-visit';
import type { Root, Link } from 'mdast';

interface Options {
  /** Only strip prefix when this is true */
  enabled?: boolean;
  /** Prefix to strip (default: '/docs') */
  prefix?: string;
}

export default function remarkStripDocsPrefix(options: Options = {}) {
  const { enabled = true, prefix = '/docs' } = options;

  return (tree: Root) => {
    if (!enabled) return;

    visit(tree, 'link', (node: Link) => {
      if (node.url && node.url.startsWith(prefix + '/')) {
        node.url = node.url.slice(prefix.length);
      }
    });
  };
}
