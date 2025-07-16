import { Plugin } from 'unified'
import { visit } from 'unist-util-visit'
import { Element } from 'hast'

interface Options {
    from: string
    to: string
}

// This plugin replaces image src paths and logs replacements to console
const _rehypeScopedPath: Plugin<Options[]> = (options) => {
    const { from, to } = options
    console.log(`[rehypeScopedPath] initialized with from='${from}', to='${to}'`)
    return (tree, file) => {
        visit(tree, 'element', (node: Element) => {
            if (
                node.tagName === 'img' &&
                typeof node.properties?.src === 'string' &&
                node.properties.src.startsWith(from)
            ) {
                const oldSrc = node.properties.src as string
                const newSrc = oldSrc.replace(from, to)
                console.log(
                    `[rehypeScopedPath] Replacing image src: ${oldSrc} -> ${newSrc}`
                )
                node.properties.src = newSrc
            } else {
                const filePath = file?.path || file?.history?.slice(-1)[0] || 'unknown'
                console.log(`[rehypeScopedPath] [${filePath}] processing file`)
                console.log(`[rehypeScopedPath] node didn't match '${node.tagName}'`)
            }
        })
    }
}

export default _rehypeScopedPath
