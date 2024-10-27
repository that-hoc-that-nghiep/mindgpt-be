import { EdgeMindmap, NodeMindmap } from "@/respository/mindmapRepository"

export function convertJsonToMermaid(nodes: NodeMindmap[], edges: EdgeMindmap[]) {
    let mermaidGraph = '"```mermaid\\ngraph TB\\n';

    // Add nodes to mermaid graph
    mermaidGraph += "%% Nodes\\n";
    nodes.forEach((node: NodeMindmap) => {
      const { id, label } = node;
      mermaidGraph += `${id}["${label}"]\\n`;
    });
  
    // Add edges to mermaid graph
    mermaidGraph += "%% Edges\\n";
    edges.forEach((edge: any) => {
      const { from, to } = edge;
      mermaidGraph += `${from} --> ${to}\\n`;
    });
  
    // Add end of mermaid graph and close code block
    mermaidGraph += '```"';
    return mermaidGraph;
}
