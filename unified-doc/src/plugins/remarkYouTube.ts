import type { Plugin } from "unified"
import { visit } from "unist-util-visit"
import type { Node } from "unist"

const remarkYouTube: Plugin = () => {
  return (tree: Node) => {
    visit(tree, ["link", "text"], (node: any, index: number, parent: any) => {
      if (!parent) return
      let raw = node.url || node.value || ""
      let ytUrl = raw.trim()

      // detect hashnode style: %[ ... ]
      const hashnodeMatch = ytUrl.match(/^%\[(.+)\]$/)
      if (hashnodeMatch) {
          ytUrl = hashnodeMatch[1]
      }

      const m =
          ytUrl.match(/youtube\.com\/watch\?v=([A-Za-z0-9_-]+)/) ||
          ytUrl.match(/youtu\.be\/([A-Za-z0-9_-]+)/) ||
          ytUrl.match(/youtube-nocookie\.com\/watch\?v=([A-Za-z0-9_-]+)/)

      if (m) {
        // replace this node entirely
        parent.children.splice(index, 1, {
          type: "mdxJsxFlowElement",
          name: "LiteYouTubeEmbed",
          attributes: [
            { type: "mdxJsxAttribute", name: "id", value: m[1] },
            { type: "mdxJsxAttribute", name: "title", value: "YouTube video" },
          ],
        })
      }
    })

    // cleanup case: stray "%[" or "]" in separate text nodes
    visit(tree, "text", (node: any, index: number, parent: any) => {
      if (!parent) return
      if (node.value.trim() === "%[" || node.value.trim() === "]") {
        parent.children.splice(index, 1)
      }
    })
  }
}

export default remarkYouTube
