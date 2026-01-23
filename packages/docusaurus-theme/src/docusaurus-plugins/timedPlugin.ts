import { Plugin } from "unified"
import {Logger, LogLevel, resolveLogLevel} from './logger'

export function timedPlugin<T extends Plugin>(
    name: string,
    plugin: T,
    opts: { logLevel?: LogLevel } = {}
): T {
    const { logLevel = LogLevel.Info } = opts
    const logger = new Logger(resolveLogLevel(opts?.logLevel), name)

    return ((...args: any[]) => {
        const instance = (plugin as any)(...args)
        return (tree: any, file: any) => {
            const start = Date.now()
            const res = instance(tree, file)
            const dur = Date.now() - start
            logger.log(`⏱ finished in ${dur}ms`)
            return res
        }
    }) as any
}
