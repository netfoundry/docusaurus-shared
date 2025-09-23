import { visit } from 'unist-util-visit'
import { Plugin } from 'unified'
import { Parent, Code } from 'mdast'

console.log('🦖 remarkCodeSections plugin loaded')

const desc_text = '@desc:'
const command_text = '@command:'
const code_text = '@code:'
const results_text = '@results:'

export const remarkCodeSections: Plugin = () => {
    return (tree) => {
        visit(tree, 'code', (node: Code, index, parent: Parent | undefined) => {
            if (!parent || !node.lang || !node.lang.startsWith('example-')) return

            const lang = node.lang.replace('example-', '').trim()
            const lines = node.value.split('\n')

            let description = ''
            let command = ''
            let code = ''
            let results = ''
            let codeTitle = ''
            let currentSection = ''

            for (const line of lines) {
                if (line.startsWith(desc_text)) {
                    currentSection = 'description'
                    description = line.replace(desc_text, '').trim()
                } else if (line.startsWith(command_text)) {
                    currentSection = 'command'
                    command = line.replace(command_text, '').trim()
                } else if (line.startsWith(code_text)) {
                    currentSection = 'code'
                    codeTitle = line.replace(code_text, '').trim()
                    code = ''
                } else if (line.startsWith(results_text)) {
                    currentSection = 'results'
                    results = line.replace(results_text, '').trim()
                } else {
                    if (currentSection === 'description') description += `\n${line}`
                    else if (currentSection === 'command') command += `\n${line}`
                    else if (currentSection === 'code') code += `\n${line}`
                    else if (currentSection === 'results') results += `\n${line}`
                }
            }

            const divWrapper: any = {
                type: 'div',
                data: { hName: 'div', hProperties: { className: 'code-section' } },
                children: [] as any[],
            }

            if (description) {
                divWrapper.children.push({
                    type: 'div',
                    data: { hName: 'div', hProperties: { className: 'code-section-desc' } },
                    children: [
                        {
                            type: 'paragraph',
                            children: [
                                { type: 'strong', children: [{ type: 'text', value: 'Description:' }] },
                            ],
                        },
                        {
                            type: 'paragraph',
                            children: [{ type: 'text', value: description.trim() }],
                            data: { hProperties: { style: 'padding-bottom: 10px;' } },
                        },
                    ],
                })
            }

            if (command) {
                divWrapper.children.push({
                    type: 'div',
                    data: { hName: 'div', hProperties: { className: 'code-section-command' } },
                    children: [
                        {
                            type: 'paragraph',
                            children: [
                                { type: 'strong', children: [{ type: 'text', value: 'Command:' }] },
                            ],
                        },
                        { type: 'code', lang: 'sh', value: command.trim() },
                    ],
                })
            }

            if (code) {
                divWrapper.children.push({
                    type: 'div',
                    data: { hName: 'div', hProperties: { className: 'code-section-code' } },
                    children: [
                        ...(codeTitle
                            ? [
                                {
                                    type: 'paragraph',
                                    children: [
                                        { type: 'strong', children: [{ type: 'text', value: codeTitle }] },
                                    ],
                                },
                            ]
                            : []),
                        { type: 'code', lang, value: code.trim() },
                    ],
                })
            }

            if (results) {
                divWrapper.children.push({
                    type: 'div',
                    data: { hName: 'div', hProperties: { className: 'code-section-results' } },
                    children: [
                        {
                            type: 'paragraph',
                            children: [
                                { type: 'strong', children: [{ type: 'text', value: 'Results:' }] },
                            ],
                        },
                        { type: 'code', lang: 'buttonless', value: results.trim() },
                    ],
                })
            }

            parent.children.splice(index, 1, divWrapper as any)
        })
    }
}
