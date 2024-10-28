export function convertJsonToMermaid(nodes: any, edges: any) {
  let mermaidGraph = "```mermaid\\ngraph TB\\n";

  mermaidGraph += "%% Nodes\\n";
  nodes.forEach((node: any) => {
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
