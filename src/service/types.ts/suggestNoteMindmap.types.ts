import { LLMModel, MindmapType } from "@/constant";

export interface SuggestNoteRequestBody {
  selectedNode: {
    id: string;
    name: string;
  };
}
export interface MindmapParamRequest {
  mindmapId: string;
  orgId: string;
}
export interface SuggestNoteAiHubRequest {
  llm: LLMModel;
  type: MindmapType;
  prompt: string;
  document: {
    type: string;
    url: string;
  };
  documentsId: string[];
  selectedNode: {
    id: string;
    name: string;
  };
  mermaid: string;
}
