import { Plugin } from 'unified'
import { visit } from 'unist-util-visit'
import { Image, Link } from 'mdast'
import { MdxJsxFlowElement, MdxjsEsm } from 'mdast-util-mdx'
import { writeFileSync, appendFileSync, existsSync } from 'fs'
import { join } from 'path'

console.log("🦖 remarkScopedPath plugin module loaded")

interface ScopedPathOptions {
    from: string
    to: string
}
interface Options {
    mappings: ScopedPathOptions[]
    debug?: boolean
}

const LOG = join(process.cwd(), 'remarkScopedPath.log')

const log = (msg: string, debug?: boolean) => {
    if (!debug) return
    console.log(msg) // also echo to console
    if (!existsSync(LOG)) {
        writeFileSync(LOG, '')
    }
    appendFileSync(LOG, `[${new Date().toISOString()}] ${msg}\n`)
}

export const remarkScopedPath: Plugin<[Options]> = (options?: Options) => {
    const { mappings = [], debug = false } = options ?? {}

    if (debug) {
        log(`🦖 remarkScopedPath initialized with ${mappings.length} mappings`, debug)
    }

    return (tree, file) => {
        const filePath = file?.path || file?.history?.slice(-1)[0] || 'unknown'
        log(`🦖 processing file: ${filePath}`, debug)

        visit(tree, 'image', (node: Image) => {
            for (const { from, to } of mappings) {
                if (node.url.startsWith(from)) {
                    const newUrl = node.url.replace(from, to)
                    log(`  🔄 img ${node.url} → ${newUrl}`, true)
                    node.url = newUrl
                } else {
                    //log(`🦖 image ${node.url} does not start with ${from}`, debug)
                }
            }
        })

        visit(tree, 'link', (node: Link) => {
            for (const { from, to } of mappings) {
                if (node.url.startsWith(from)) {
                    const newUrl = node.url.replace(from, to)
                    log(`  🔄 link ${node.url} → ${newUrl}`, true)
                    node.url = newUrl
                }
            }
        })

        // visit JSX flow elements
        visit(tree, 'mdxJsxFlowElement', (node: MdxJsxFlowElement) => {
            if (Array.isArray(node.attributes)) {
                for (const attr of node.attributes) {
                    if (attr.type === 'mdxJsxAttribute' && typeof attr.value === 'string') {
                        for (const { from, to } of mappings) {
                            if (attr.value.startsWith(from)) {
                                const newVal: string = attr.value.replace(from, to)
                                log(`  🔄 jsx <${node.name}> ${attr.name}: ${attr.value} → ${newVal}`, true)
                                attr.value = newVal
                            }
                        }
                    }
                }
            }
        })

        // visit ESM imports
        visit(tree, 'mdxjsEsm', (node: MdxjsEsm) => {
            for (const { from, to } of mappings) {
                const re = new RegExp(`(['"])${from}/`, 'g')
                const newVal = node.value.replace(re, `$1${to}/`)
                if (newVal !== node.value) {
                    log(`🦖 esm rewrite (${from} → ${to}):\n--- before ---\n${node.value}\n--- after ---\n${newVal}`, true)
                    node.value = newVal
                }
            }
        })

        log(` `, debug)
    }
}
