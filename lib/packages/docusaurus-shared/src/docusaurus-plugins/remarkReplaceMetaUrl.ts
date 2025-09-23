import { Plugin } from 'unified'
import { visit } from 'unist-util-visit'
import { Root } from 'mdast'
import {Logger, LogLevel, resolveLogLevel} from './logger'

console.log("🦖 remarkReplaceMetaUrl plugin loaded")

interface Options {
    from: string
    to: string
    logLevel?: LogLevel
}

export const remarkReplaceMetaUrl: Plugin<[Options], Root> = (options?: Options) => {
    const { from = '', to = '', logLevel = LogLevel.Silent } = options ?? {}
    const logger = new Logger(resolveLogLevel(options?.logLevel), 'remarkReplaceMetaUrl')

    logger.log(`initialized: replacing "${from}" → "${to}"`)

    return (tree: Root) => {
        visit(tree, 'mdxJsxFlowElement', (node: any) => {
            if (node.name === 'meta' && Array.isArray(node.attributes)) {
                for (const attr of node.attributes) {
                    if (attr.name === 'content' && typeof attr.value === 'string' && attr.value.includes(from)) {
                        const newVal = attr.value.replace(from, to)
                        logger.log(`rewriting: "${attr.value}" → "${newVal}"`, LogLevel.Info)
                        attr.value = newVal
                    }
                }
            }
        })
    }
}

export default remarkReplaceMetaUrl
