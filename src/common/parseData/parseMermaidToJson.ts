import {
  EdgeMindmap,
  MindmapResponeAIHub,
  NodeMindmap,
} from "@/respository/mindmapRepository";
import { MindmapType, RoleChat } from "@/constant";

export const parseMermaidToJson = async (
  responseData: string,
  promptUser: string,
  type: MindmapType,
  documentsId: string[],
  orgId: string,
  document?: {}
) => {
  const formattedMermaidData = responseData
    .replace(/\s*(?=\[)/g, "")
    .replace(/(?<=\])\s*/g, "")
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\\"/g, '"')
    .replace("mermaid\n", "")
    .replace("graph TB\n", "");

  const nodes: NodeMindmap[] = [];
  const edges: EdgeMindmap[] = [];
  const nodeLevels: { [key: string]: number } = {};

  const lines = formattedMermaidData.trim().split("\n");

  lines.forEach((line: string) => {
    const nodeMatch = line.match(/(\w+)\["([^"]+)"\]/);
    if (nodeMatch) {
      const id = nodeMatch[1];

      const label = nodeMatch[2].replace(/[\u{1F600}-\u{1F6FF}]/gu, "").trim();

      nodes.push({
        id: id,
        label: label,
        level: -1,
        pos: { x: 0, y: 0 },
        text_color: "",
        bg_color: "",
        size: { width: 0, height: 0 },
        note: "",
      });
    }

    const edgeMatch = line.match(/(\w+)\s*-->\s*(\w+)/);
    if (edgeMatch) {
      const from = edgeMatch[1];
      const to = edgeMatch[2];
      edges.push({
        id: `${from} --> ${to}`,
        from: from,
        to: to,
        name: `${from} --> ${to}`,
      });
    }
  });

  function assignLevels() {
    nodeLevels["A"] = 0;

    edges.forEach((edge) => {
      const fromLevel = nodeLevels[edge.from];
      if (fromLevel !== undefined) {
        nodeLevels[edge.to] = Math.max(
          nodeLevels[edge.to] || -1,
          fromLevel + 1
        );
      }
    });
  }

  assignLevels();

  nodes.forEach((node) => {
    node.level = nodeLevels[node.id] >= 0 ? nodeLevels[node.id] : 0;
  });

  const title = nodes[0]?.label || "";
  const prompt = title.replace(/[\u{1F600}-\u{1F6FF}]/gu, "").trim();

  const jsonData: MindmapResponeAIHub = {
    title: title,
    prompt: promptUser,
    thumbnail: "",
    type: type,
    nodes: nodes,
    edges: edges,
    documentsId: documentsId || [],
    document: document || {},
    orgId: orgId,
    conversation: [
      {
        role: RoleChat.USER,
        content: "Hello",
      },
      {
        role: RoleChat.AI,
        content: "Hi",
      },
    ],
  };

  return jsonData;
};
