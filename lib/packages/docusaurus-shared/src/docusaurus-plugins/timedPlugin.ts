import { Plugin } from "unified"

console.log("🦖 timedPlugin plugin module loaded")

export function timedPlugin<T extends Plugin>(name: string, plugin: T): T {
    return ((...args: any[]) => {
        const instance = (plugin as any)(...args)
        return (tree: any, file: any) => {
            console.time(`⏱ ${name}`)
            const res = instance(tree, file)
            console.timeEnd(`⏱ ${name}`)
            return res
        }
    }) as any
}
