import { MindmapType } from "@/constant";

export interface Node {
  _id: string;
  id: string;
  label: string;
  level: number;
  pos: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  text_color: string;
  bg_color: string;
  note: string;
}

export interface Edge {
  _id: string;
  id: string;
  from: string;
  to: string;
  name: string;
}

export interface Document {
  type: string;
  url: string;
}

export interface Conversation {
  _id: string;
}

export interface GetMindmapByIdResponse {
  _id: string;
  title: string;
  thumbnail: string;
  prompt: string;
  type: MindmapType;
  nodes: Node[];
  edges: Edge[];
  documentsId: string[];
  document: Document;
  orgId: string;
  conversation: Conversation[];
}
