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
  llm: LLMModel;
  type: MindmapType;
  orgId: string;
  depth: number;
  child: number;
}

export interface CreateRequest {
  llm: LLMModel;
  type: MindmapType;
  prompt?: string;
  docType?: DocumentTypeRequest;
  docUrl?: string;
  documentsId?: string;
  depth: number;
  child: number;
  orgId: string;
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
