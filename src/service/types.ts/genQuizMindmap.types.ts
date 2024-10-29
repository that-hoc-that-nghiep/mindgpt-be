import { LLMModel, MindmapType } from "@/constant";
export interface SelectdNode {
  id: string;
  name: string;
}
export interface GenQuizRequestBody {
  selectedNodes: SelectdNode[];
}
export interface GenQuizAiHubRequest {
  llm: LLMModel;
  type: MindmapType;
  prompt: string;
  document: {
    type: string;
    url: string;
  };
  documentsId: string[];
  questionNumber: number;
  selectedNodes: SelectdNode[];
  mermaid: string;
}
