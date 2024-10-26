import { EdgeMindmap, NodeMindmap } from "@/respository/mindmapRepository"


export function convertJsonToMermaid(nodes: NodeMindmap[], edges: EdgeMindmap[]) {
    let mermaidGraph = "```mermaid\\ngraph TB\\n";

    mermaidGraph += "%% Nodes\\n";
    nodes.forEach((node: NodeMindmap) => {
        const { id, label } = node;
        mermaidGraph += `${id}["${label}"]\\n`;
    });

    mermaidGraph += "%% Edges\\n";
    edges.forEach((edge: any) => {
        const { from, to } = edge;
        mermaidGraph += `${from} --> ${to}\\n`;
    });

    mermaidGraph += "```";
    return mermaidGraph;
}
