import { Plugin } from 'unified'
import { visit } from 'unist-util-visit'
import { Image, Html } from 'mdast'
import { MdxJsxFlowElement, MdxjsEsm } from 'mdast-util-mdx'
import { writeFileSync, appendFileSync } from 'fs'
import { join } from 'path'

interface Options {
    from: string
    to: string
}

const LOG = join(process.cwd(), 'remarkScopedPath.log')
writeFileSync(LOG, '')

const log = (msg:string) => {
    appendFileSync(LOG, `[${new Date().toISOString()}] ${msg}\n`)
}

const remarkScopedPath: Plugin<[Options[]]> = (options) => {
    return (tree, file) => {
        const filePath = file?.path || file?.history?.slice(-1)[0] || 'unknown'
        log(`processing file ${filePath}`)
        visit(tree, 'image', (node: Image) => {
            if (typeof node.url === 'string') {
                for (const { from, to } of options) {
                    if (node.url.startsWith(from)) {
                        node.url = node.url.replace(from, to)
                    }
                }
            }
        })


        visit(tree, 'mdxJsxFlowElement', (node: MdxJsxFlowElement) => {
            if (node.name === 'img' && Array.isArray(node.attributes)) {
                for (const attr of node.attributes) {
                    if (
                        attr.type === 'mdxJsxAttribute' &&
                        attr.name === 'src' &&
                        typeof attr.value === 'string'
                    ) {
                        for (const { from, to } of options) {
                            if (attr.value.startsWith(from)) {
                                attr.value = attr.value.replace(from, to)
                            }
                        }
                    }
                }
            }
        })

        visit(tree, 'mdxjsEsm', (node: MdxjsEsm) => {
            log(`    value at start: ${node.value}'`)
            for (const { from, to } of options) {
                log(`    from='${from}'`)
                log(`    to='${to}`)
                const re = new RegExp(`(['"])${from}/`, 'g')
                node.value = node.value.replace(re, `$1${to}/`)
            }
            log(`    value at end  : ${node.value}'`)
        })
        log(`cwd: ${file.cwd}`)
        log(` `)
    }
}

export default remarkScopedPath
