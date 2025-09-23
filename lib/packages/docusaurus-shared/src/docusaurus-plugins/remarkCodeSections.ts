import { Plugin } from 'unified'
import { visit } from 'unist-util-visit'
import { Image, Link } from 'mdast'
import { MdxJsxFlowElement, MdxjsEsm } from 'mdast-util-mdx'
import { Logger, LogLevel } from '../utils/logger'

console.log("🦖 remarkScopedPath plugin module loaded")

interface ScopedPathOptions {
    from: string
    to: string
}
interface Options {
    mappings: ScopedPathOptions[]
    logLevel?: LogLevel
}

export const remarkScopedPath: Plugin<[Options]> = (options?: Options) => {
    const { mappings = [], logLevel = LogLevel.Silent } = options ?? {}
    const logger = new Logger(logLevel, 'remarkScopedPath')

    logger.log(`initialized with ${mappings.length} mappings`)

    return (tree, file) => {
        const filePath = file?.path || file?.history?.slice(-1)[0] || 'unknown'
        logger.log(`processing file: ${filePath}`, LogLevel.Debug)

        const rewrite = (val: string, from: string, to: string, ctx: string) => {
            if (val.startsWith(from)) {
                const newVal = val.replace(from, to)
                logger.log(`🔄 ${ctx} ${val} → ${newVal}`, LogLevel.Info)
                return newVal
            }
            return val
        }

        visit(tree, 'image', (node: Image) => {
            for (const { from, to } of mappings) node.url = rewrite(node.url, from, to, 'img')
        })

        visit(tree, 'link', (node: Link) => {
            for (const { from, to } of mappings) node.url = rewrite(node.url, from, to, 'link')
        })

        visit(tree, 'mdxJsxFlowElement', (node: MdxJsxFlowElement) => {
            node.attributes?.forEach(attr => {
                if (attr.type === 'mdxJsxAttribute' && typeof attr.value === 'string') {
                    for (const { from, to } of mappings)
                        attr.value = rewrite(attr.value, from, to, `jsx <${node.name}> ${attr.name}:`)
                }
            })
        })

        visit(tree, 'mdxjsEsm', (node: MdxjsEsm) => {
            for (const { from, to } of mappings) {
                const re = new RegExp(`(['"])${from}/`, 'g')
                const newVal = node.value.replace(re, `$1${to}/`)
                if (newVal !== node.value) {
                    logger.log(
                        `esm rewrite (${from} → ${to}):\n--- before ---\n${node.value}\n--- after ---\n${newVal}`,
                        LogLevel.Info
                    )
                    node.value = newVal
                }
            }
        })

        logger.log(` `, LogLevel.Debug)
    }
}
