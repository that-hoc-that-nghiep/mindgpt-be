export enum OrgSubscription {
  FREE = "free",
  PLUS = "plus",
  PRO = "pro",
}

export enum MindmapType {
  CREATIVE = "creative",
  SUMMARY = "summary",
}

export enum LLMModel {
  GPT_4o = "gpt-4o",
  GPT_4o_mini = "gpt-4o-mini",
}

export enum DocumentTypeRequest {
  PDF = "pdf",
  WEB = "web",
  YOUTUBE = "youtube",
}

export enum AtributeNode {
  X = 0,
  Y = 0,
  TEXT_COLOR = "#000",
  BG_COLOR = "#fff",
  SIZE_WIDTH = 120,
  SIZE_HEIGHT = 80,
}

export enum RoleChat {
  USER = "user",
  AI = "ai",
}

export enum MinmeTypeFile {
  JSON = "application/json",
  PDF = "application/pdf",
  FORMDATA = "multipart/form-data",
}

export const FILE_LIMITS: Record<string, number> = {
  free: 5 * 1024 * 1024,
  plus: 10 * 1024 * 1024,
  pro: 15 * 1024 * 1024,
};

export const sizeMindmap = {
  depth: 4,
  child: 3,
};
