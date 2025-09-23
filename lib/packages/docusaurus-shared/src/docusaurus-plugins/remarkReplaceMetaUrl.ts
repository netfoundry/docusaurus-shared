import { Plugin } from 'unified';
import { visit } from 'unist-util-visit';
import { Root } from 'mdast';

console.log("🦖 remarkReplaceMetaUrl plugin loaded");

interface Options {
    from: string;
    to: string;
    debug?: boolean;
}

export const remarkReplaceMetaUrl: Plugin<[Options], Root> = (options?: Options) => {
    const { from = "", to = "", debug = false } = options ?? {}

    if (debug) {
        console.log(`🦖 remarkReplaceMetaUrl initialized: replacing "${from}" → "${to}"`);
    }

    return (tree: Root) => {
        visit(tree, 'mdxJsxFlowElement', (node: any) => {
            if (node.name === 'meta' && Array.isArray(node.attributes)) {
                for (const attr of node.attributes) {
                    if (attr.name === 'content' && typeof attr.value === 'string') {
                        if (attr.value.includes(from)) {
                            if (debug) {
                                console.log(`🦖 [remarkReplaceMetaUrl] rewriting: "${attr.value}" → "${attr.value.replace(from, to)}"`);
                            }
                            attr.value = attr.value.replace(from, to);
                        }
                    }
                }
            }
        });
    };
};

export default remarkReplaceMetaUrl;
