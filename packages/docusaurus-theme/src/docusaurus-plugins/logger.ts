import { writeFileSync, appendFileSync, existsSync } from 'fs'
import { join } from 'path'

export enum LogLevel {
    Silent = 0,
    Info = 1,
    Debug = 2,
}

const LOG = join(process.cwd(), 'remark-plugins.log')

export class Logger {
    constructor(private level: LogLevel, private name: string) {}
    log(msg: unknown, level: LogLevel = LogLevel.Info) {
        if (this.level === LogLevel.Silent) return
        if (level > this.level) return

        const text = String(msg)
        if (!text.trim()) return

        const line = `[${this.name}] ${LogLevel[level]} ${text}`
        if (!existsSync(LOG)) writeFileSync(LOG, '')
        appendFileSync(LOG, `[${new Date().toISOString()}] ${line}\n`)
    }
}

export function resolveLogLevel(val: unknown): LogLevel {
    if (typeof val === "number" && LogLevel[val] !== undefined) {
        return val as LogLevel
    }
    if (typeof val === "string") {
        const key = val[0].toUpperCase() + val.slice(1).toLowerCase()
        if (key in LogLevel) {
            return LogLevel[key as keyof typeof LogLevel]
        }
    }
    return LogLevel.Silent
}