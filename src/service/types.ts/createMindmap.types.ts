import { DocumentTypeRequest, LLMModel, MindmapType } from "@/constant";

export interface CreativeRequestAI {
  llm: LLMModel;
  type: MindmapType;
  prompt: string;
  documentsId: string[];
  depth: number;
  child: number;
}

export interface CreateMinmapByUploadFileRequest {
  type: MindmapType;
  orgId: string;
  depth: number;
  child: number;
}

export interface CreateRequest {
  type: MindmapType;
  prompt?: string;
  docType?: DocumentTypeRequest;
  docUrl?: string;
  documentsId?: string;
  depth: number;
  child: number;
  orgId: string;
}
export interface UpdateRequest {
  nodes: [{
    id: string;
    label: string;
    pos: { x: number; y: number };
    text_color: string;
    bg_color: string;
    size: { width: number; height: number };
    note: string;
    type_update: string;
    referNode: string; //id of referenced node
  }]
}

export interface SummaryRequestAI {
  llm: LLMModel;
  type: MindmapType;
  document: {
    type: DocumentTypeRequest;
    url: string;
  };
  prompt: string;
  documentsId: string[];
  depth: number;
  child: number;
}
