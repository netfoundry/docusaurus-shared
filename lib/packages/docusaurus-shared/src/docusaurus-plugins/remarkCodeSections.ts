import {visit} from "unist-util-visit"
import type {Plugin} from "unified"
import type {Node} from "unist"
import {Logger, LogLevel, resolveLogLevel} from "./logger"

interface Options {
    logLevel?: LogLevel
}

export const remarkCodeSections: Plugin<[Options?]> = (options?: Options) => {
    const logger = new Logger(resolveLogLevel(options?.logLevel), "remarkCodeSections")

    const desc_text = "@desc:"
    const command_text = "@command:"
    const code_text = "@code:"
    const results_text = "@results:"

    return (tree: Node) => {
        visit(tree, "code", (node: any, index: number, parent: any) => {
            if (!node?.value) return

            const hasActivator = /@desc:|@command:|@code:|@results:/.test(node.value)
            if (!hasActivator) return

            logger.log(node, LogLevel.Debug)
            if (node.lang && node.lang.startsWith("example")) {
                const lang = node.lang.replace("example-", "").trim()
                const lines = node.value.split("\n")
                let description = "", command = "", code = "", results = "", codeTitle = ""
                let currentSection = ""

                lines.forEach((line: string) => {
                    if (line.startsWith(desc_text)) {
                        currentSection = "description"
                        description = line.replace(desc_text, "").trim()
                    } else if (line.startsWith(command_text)) {
                        currentSection = "command"
                        command = line.replace(command_text, "").trim()
                    } else if (line.startsWith(code_text)) {
                        currentSection = "code"
                        codeTitle = line.replace(code_text, "").trim()
                    } else if (line.startsWith(results_text)) {
                        currentSection = "results"
                        results = line.replace(results_text, "").trim()
                    } else {
                        if (currentSection === "description") description += `\n${line}`
                        else if (currentSection === "command") command += `\n${line}`
                        else if (currentSection === "code") code += `\n${line}`
                        else if (currentSection === "results") results += `\n${line}`
                    }
                })

                const divWrapper = {
                    type: "div",
                    data: { hName: "div", hProperties: { className: "code-section" } },
                    children: [] as any[],
                }

                if (description) {
                    const descDiv = {
                        type: "div",
                        data: { hName: "div", hProperties: { className: "code-section-desc" } },
                        children: [] as any[],
                    }
                    descDiv.children.push(
                        { type: "paragraph", children: [{ type: "strong", children: [{ type: "text", value: "Description:" }] }] },
                        { type: "paragraph", children: [{ type: "text", value: description.trim() }], data: { hProperties: { style: "padding-bottom: 10px;" } } },
                    )
                    divWrapper.children.push(descDiv)
                }

                if (command) {
                    const cmdDiv = {
                        type: "div",
                        data: { hName: "div", hProperties: { className: "code-section-command" } },
                        children: [] as any[],
                    }
                    cmdDiv.children.push(
                        { type: "paragraph", children: [{ type: "strong", children: [{ type: "text", value: "Command:" }] }] },
                        { type: "code", lang: "sh", value: command.trim() },
                    )
                    divWrapper.children.push(cmdDiv)
                }

                if (code) {
                    const codeDiv = {
                        type: "div",
                        data: { hName: "div", hProperties: { className: "code-section-code" } },
                        children: [] as any[],
                    }
                    codeDiv.children.push(
                        { type: "paragraph", children: [{ type: "strong", children: [{ type: "text", value: codeTitle }] }] },
                        { type: "code", lang, value: code.trim() },
                    )
                    divWrapper.children.push(codeDiv)
                }

                if (results) {
                    const resultsDiv = {
                        type: "div",
                        data: { hName: "div", hProperties: { className: "code-section-results" } },
                        children: [] as any[],
                    }
                    resultsDiv.children.push(
                        { type: "paragraph", children: [{ type: "strong", children: [{ type: "text", value: "Results:" }] }] },
                        { type: "code", lang: "buttonless", value: results.trim() },
                    )
                    divWrapper.children.push(resultsDiv)
                }

                parent.children.splice(index, 1, divWrapper)
            }
        })
    }
}
