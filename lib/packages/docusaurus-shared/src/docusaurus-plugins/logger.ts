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
    log(msg: string, level: LogLevel = LogLevel.Info) {
        if (this.level < level) return
        const tagged = `[${this.name}] ${msg}`
        console.log(tagged)
        if (!existsSync(LOG)) writeFileSync(LOG, '')
        appendFileSync(LOG, `[${new Date().toISOString()}] ${tagged}\n`)
    }
}
