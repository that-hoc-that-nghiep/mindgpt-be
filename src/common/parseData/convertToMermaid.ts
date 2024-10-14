import { Edge, Node } from "@/services";

export function convertToMermaid(nodes: Node[], edges: Edge[]) {
  let mermaidGraph = "mermaid\ngraph TB\n";

  nodes.forEach((node: Node) => {
    const { id, label } = node;
    mermaidGraph += `${id}["${label}"]\n`;
  });

  edges.forEach((edge: any) => {
    const { from, to } = edge;
    mermaidGraph += `${from} --> ${to}\n`;
  });

  return mermaidGraph;
}

