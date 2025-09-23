import { Plugin } from 'unified'
import { visit } from 'unist-util-visit'
import yaml from 'js-yaml'
import { Parent } from 'unist'
import { Literal } from 'unist'
import {Logger, LogLevel, resolveLogLevel} from './logger'

console.log("🦖 remarkYamlTable plugin module loaded")

interface Code extends Literal {
    type: 'code'
    lang?: string
    value: string
}

interface TableCell {
    type: 'tableCell'
    children: { type: 'text'; value: string }[]
}

interface TableRow {
    type: 'tableRow'
    children: TableCell[]
}

interface Table {
    type: 'table'
    align: (null | 'left' | 'right' | 'center')[]
    children: TableRow[]
}

interface Options {
    logLevel?: LogLevel
}

export const remarkYamlTable: Plugin<[Options]> = (options?: Options) => {
    const { logLevel = LogLevel.Silent } = options ?? {}
    const logger = new Logger(resolveLogLevel(options?.logLevel), 'remarkYamlTable')

    logger.log('initialized')

    return (tree) => {
        visit(tree, 'code', (node: Code, index: number | undefined, parent: Parent | undefined) => {
            if (!parent || index === undefined) return
            if (node.lang === 'yaml-table') {
                try {
                    const data = yaml.load(node.value)
                    if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
                        const headers = Object.keys(data[0] as Record<string, unknown>)

                        const tableRows: TableRow[] = (data as Record<string, unknown>[]).map((row) => ({
                            type: 'tableRow',
                            children: headers.map<TableCell>((header) => ({
                                type: 'tableCell',
                                children: [{ type: 'text', value: String(row[header] ?? '') }],
                            })),
                        }))

                        const tableNode: Table = {
                            type: 'table',
                            align: headers.map(() => null),
                            children: [
                                {
                                    type: 'tableRow',
                                    children: headers.map<TableCell>((header) => ({
                                        type: 'tableCell',
                                        children: [{ type: 'text', value: header }],
                                    })),
                                },
                                ...tableRows,
                            ],
                        }

                        parent.children[index] = tableNode
                        logger.log(`generated table with ${headers.length} columns and ${data.length} rows`, LogLevel.Info)
                    }
                } catch (error) {
                    logger.log(`YAML parsing error: ${(error as Error).message}`, LogLevel.Info)
                }
            }
        })
    }
}
