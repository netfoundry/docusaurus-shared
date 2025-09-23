import type { Plugin } from 'unified'
import { visit } from 'unist-util-visit'
import type { Node } from 'unist'
import { Logger, LogLevel } from '../utils/logger'

console.log("🦖 remarkYouTube plugin module loaded")

interface YouTubeOptions {
    logLevel?: LogLevel
}

export const remarkYouTube: Plugin<[YouTubeOptions]> = (options?: YouTubeOptions) => {
    const { logLevel = LogLevel.Silent } = options ?? {}
    const logger = new Logger(logLevel, 'remarkYouTube')

    logger.log('initialized')

    return (tree: Node) => {
        visit(tree, ['link', 'text'], (node: any, index: number | undefined, parent: any) => {
            if (!parent || typeof index !== 'number') return
            let raw = node.url || node.value || ''
            let ytUrl = raw.trim()

            const hashnodeMatch = ytUrl.match(/^%\[(.+)\]$/)
            if (hashnodeMatch) {
                ytUrl = hashnodeMatch[1]
                logger.log(`hashnode-style embed detected: ${ytUrl}`, LogLevel.Info)
            }

            const m =
                ytUrl.match(/youtube\.com\/watch\?v=([A-Za-z0-9_-]+)/) ||
                ytUrl.match(/youtu\.be\/([A-Za-z0-9_-]+)/) ||
                ytUrl.match(/youtube-nocookie\.com\/watch\?v=([A-Za-z0-9_-]+)/)

            if (m) {
                logger.log(`rewriting YouTube URL: ${ytUrl} → videoId=${m[1]}`, LogLevel.Info)
                parent.children.splice(index, 1, {
                    type: 'mdxJsxFlowElement',
                    name: 'LiteYouTubeEmbed',
                    attributes: [
                        { type: 'mdxJsxAttribute', name: 'id', value: m[1] },
                        { type: 'mdxJsxAttribute', name: 'title', value: 'YouTube video' },
                    ],
                })
            }
        })

        visit(tree, 'text', (node: any, index: number | undefined, parent: any) => {
            if (!parent || typeof index !== 'number') return
            if (node.value.trim() === '%[' || node.value.trim() === ']') {
                logger.log(`stripping hashnode bracket artifact: ${node.value}`, LogLevel.Debug)
                parent.children.splice(index, 1)
            }
        })
    }
}
