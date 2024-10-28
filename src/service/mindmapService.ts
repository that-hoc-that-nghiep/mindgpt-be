import {
  DocumentTypeRequest,
  FILE_LIMITS,
  LLMModel,
  MindmapType,
  OrgSubscription,
} from "@/constant";
import axios from "axios";
import { MindmapRepository } from "@/respository/mindmapRepository";
import { parseMermaidToJson } from "@/common/parseData/parseMermaidToJson";
import { createClient } from "@supabase/supabase-js";
import config from "config";
import * as fs from "fs/promises";
import {
  CreateMinmapByUploadFileRequest,
  CreateRequest,
  CreativeRequestAI,
  UpdateRequest,
  SummaryRequestAI,
} from "./types.ts/createMindmap.types";
import { Organization } from "./authService";
import { unlink } from "fs/promises";
import { convertJsonToMermaid } from "@/common/parseData/convertJsonToMermaid";

interface MindmapNode {
  label: string;
  pos?: string;
  text_color?: string;
  bg_color?: string;
  size?: string;
  note?: string;
}

interface Mindmap {
  nodes: MindmapNode[];
}

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);
const baseUrl = config.API_AI_HUB;
const url = `${baseUrl}/mindmap/create`;
const url_editAI = `${baseUrl}/mindmap/edit`;
export class MindmapService {
  private mindmapRepository: MindmapRepository;
  constructor(repository: MindmapRepository = new MindmapRepository()) {
    this.mindmapRepository = repository;
  }
  async createMindmap(values: CreateRequest, llmPackage: LLMModel) {
    try {
      const parseDocumentsId =
        values.documentsId?.replace(/[\[\]\"]/g, "").split(",") || [];
      if (parseDocumentsId.length === 1 && parseDocumentsId[0] === "") {
        parseDocumentsId.length = 0; // Chuyển thành mảng rỗng
      }
      switch (values.type) {
        case MindmapType.CREATIVE:
          const requestAI: CreativeRequestAI = {
            llm: llmPackage,
            type: values.type,
            prompt: values.prompt || "",
            documentsId: parseDocumentsId,
            depth: Number(values.depth),
            child: Number(values.child),
          };
          const parsedData = handleParseMermaid(values, requestAI);
          const newMindmap = await this.mindmapRepository.createNewMindmap(
            await parsedData
          );
          return newMindmap;
        case MindmapType.SUMMARY:
          switch (values.docType) {
            case DocumentTypeRequest.PDF:
              const requestAIByPdf: SummaryRequestAI = {
                llm: llmPackage,
                type: values.type,
                document: {
                  type: values.docType,
                  url: values.docUrl || "",
                },
                prompt: "",
                documentsId: parseDocumentsId,
                depth: Number(values.depth),
                child: Number(values.child),
              };
              const parsedDataLinkPdf = handleParseMermaid(
                values,
                requestAIByPdf
              );
              const newMindmapByLinkPdf =
                await this.mindmapRepository.createNewMindmap(
                  await parsedDataLinkPdf
                );
              return newMindmapByLinkPdf;
            case DocumentTypeRequest.WEB:
              const requestAIByWeb: SummaryRequestAI = {
                llm: llmPackage,
                type: values.type,
                document: {
                  type: values.docType,
                  url: values.docUrl || "",
                },
                prompt: "",
                documentsId: parseDocumentsId,
                depth: Number(values.depth),
                child: Number(values.child),
              };
              const parsedDataWeb = handleParseMermaid(values, requestAIByWeb);
              const newMindmapByWeb =
                await this.mindmapRepository.createNewMindmap(
                  await parsedDataWeb
                );
              return newMindmapByWeb;
            case DocumentTypeRequest.YOUTUBE:
              const requestAIByYoutube: SummaryRequestAI = {
                llm: llmPackage,
                type: values.type,
                document: {
                  type: values.docType,
                  url: values.docUrl || "",
                },
                prompt: "",
                documentsId: parseDocumentsId,
                depth: Number(values.depth),
                child: Number(values.child),
              };
              const parsedDataYoutube = handleParseMermaid(
                values,
                requestAIByYoutube
              );
              const newMindmapByYoutube =
                await this.mindmapRepository.createNewMindmap(
                  await parsedDataYoutube
                );
              return newMindmapByYoutube;
          }
      }
    } catch (error) {
      const errorMessage = `Error creating new mindmap: ${(error as Error).message
        }`;
      console.log(errorMessage);
      throw new Error(errorMessage);
    }
  }

  async createNewMindmapByUploadFile(
    values: CreateMinmapByUploadFileRequest,
    filePdf: any,
    llmPackage: LLMModel
  ) {
    try {
      const fileData = await fs.readFile(filePdf.path);
      const dataSupabase = await supabase.storage
        .from("document")
        .upload(filePdf.filename, fileData, {
          cacheControl: "3600",
          upsert: false,
          contentType: filePdf.mimetype,
        })
        .catch((error) => {
          throw new Error("Error uploading file to Supabase: " + error);
        });
      const fullPathSupabase: any = dataSupabase.data?.path;
      const linkPublicSupabase = await supabase.storage
        .from("document")
        .getPublicUrl(fullPathSupabase).data.publicUrl;
      await unlink(filePdf.path);
      const requestAIHubFile: SummaryRequestAI = {
        llm: llmPackage,
        type: values.type,
        document: {
          type: DocumentTypeRequest.PDF,
          url: linkPublicSupabase,
        },
        documentsId: [],
        prompt: "",
        depth: Number(values.depth),
        child: Number(values.child),
      };

      const countLimit = 3;
      let count = 1;

      do {
        const responseAiHub = await axios.post(url, requestAIHubFile, {
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
        });
        const responseBody = responseAiHub.data;
        if (responseBody && responseBody.hasOwnProperty("data")) {
          const responseBodyData = responseBody.data;
          const responseDocumentsId = responseBody.documentsId;
          const parsedData = parseMermaidToJson(
            responseBodyData,
            "",
            requestAIHubFile.type,
            responseDocumentsId,
            values.orgId,
            requestAIHubFile.document
          );
          const levelZeroNodes = (await parsedData).nodes.filter(
            (node) => node.level === 0
          );
          if (levelZeroNodes.length == 1) {
            const newMindmap = await this.mindmapRepository.createNewMindmap(
              await parsedData
            );
            return newMindmap;
          } else {
            count++;
            continue;
          }
        } else {
          count++;
        }
      } while (count < countLimit);
    } catch (error) {
      const errorMessage = `Error creating new mindmap by upload file: ${(error as Error).message
        }`;
      console.log(errorMessage);
      throw new Error(errorMessage);
    }
  }

  async getAllMindmaps(
    orgId: string,
    limit: number,
    page: number,
    keyword: string
  ) {
    try {
      const mindmaps = await this.mindmapRepository.getAllMindmaps(
        orgId,
        limit,
        page,
        keyword
      );
      return mindmaps;
    } catch (error) {
      const errorMessage = `Error getting all mindmaps: ${(error as Error).message
        }`;
      console.log(errorMessage);
      throw new Error(errorMessage);
    }
  }

  async getMindmapById(mindmapId: string) {
    try {
      const mindmap = await this.mindmapRepository.getMindmapById(mindmapId);
      return mindmap;
    } catch (error) {
      const errorMessage = `Error getting mindmap: ${(error as Error).message}`;
      console.log(errorMessage);
      throw new Error(errorMessage);
    }
  }
  async deleteMindmap(mindmapId: string) {
    try {
      const mindmapGetById = await this.mindmapRepository.getMindmapById(
        mindmapId
      );
      await this.mindmapRepository.deleteMindmap(mindmapId);
      if (
        mindmapGetById?.type === MindmapType.SUMMARY &&
        mindmapGetById.document.type === DocumentTypeRequest.PDF
      ) {
        const documentsId = mindmapGetById.documentsId;
        const fileName = getFileNameFromUrl(mindmapGetById.document.url);
        const { error: storageError } = await supabase.storage
          .from("document")
          .remove([fileName]);
        if (storageError) {
          throw new Error(
            `Failed to remove file from storage supabase: ${storageError.message}`
          );
        }
        handleCallApiDeleteDocumentsId(documentsId);
      }
    } catch (e) {
      const errorMessage = `Error delete mindmap: ${(e as Error).message}`;
      console.log(errorMessage);
      throw new Error(errorMessage);
    }
  }

  async updateMindmap(mindmapId: string, values: UpdateRequest) {
    try {
      const mindmap = await this.mindmapRepository.updateMindmap(mindmapId, values);
      return mindmap;
    } catch (error) {
      const errorMessage = `Error update mindmap: ${(error as Error).message} 3`;
      console.log(errorMessage);
      throw new Error(errorMessage);
    }
  }
  async editMindmapByAI(values: any, llmPackage: any, mindmap: any) {
    try {
      const mermaid = convertJsonToMermaid(mindmap.nodes, mindmap.edges);
      const requestAIConversation = {
        llm: llmPackage,
        type: mindmap.type,
        document: mindmap.document,
        documentsId: mindmap.documentsId,
        mermaid: mermaid,
        prompt: values.prompt,
        selectedNodes: values.selectedNodes
      }

      const response = await axios.put(url_editAI, requestAIConversation);

      const newMindmapData = response.data.data;

      const newJsonMindmap = await parseMermaidToJson(
        newMindmapData.mindmap,
        mindmap.prompt,
        mindmap.type,
        mindmap.documentsId,
        mindmap.orgId,
        mindmap.document
      );
      if (newJsonMindmap) {
        newJsonMindmap.conversation = mindmap.conversation;
      }

      newJsonMindmap?.nodes.forEach((newNode: any) => {
        const matchingOldNode = mindmap.nodes.find(
          (oldNode: any) => oldNode.label === newNode.label
        );

        if (matchingOldNode) {
          newNode.pos = matchingOldNode.pos;
          newNode.text_color = matchingOldNode.text_color;
          newNode.bg_color = matchingOldNode.bg_color;
          newNode.size = matchingOldNode.size;
          newNode.note = matchingOldNode.note;
        }
      });

      return {
        newMindmap: newJsonMindmap,
        message: newMindmapData.message
      };
    } catch (error) {
      throw new Error("Error editing mindmap");
    }
  };

}

export const validatePackageOrg = async (
  file: Express.Multer.File,
  orgInfo?: Organization
) => {
  const packageOrg = orgInfo?.subscription;
  const sizePackegeOrg = FILE_LIMITS[packageOrg as OrgSubscription];
  if (file.size > sizePackegeOrg) {
    await unlink(file.path);
    throw new Error(
      `Package ${packageOrg} is limited to ${sizePackegeOrg / (1024 * 1024)} MB`
    );
  }
  return true;
};

export const handleParseMermaid = async (
  values: CreateRequest,
  requestBody: any
) => {
  const countLimit = 3;
  let count = 1;
  do {
    const responseAiHub = await axios
      .post(url, requestBody, {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        validateStatus: function (status: number) {
          return status >= 200 && status < 300;
        },
      })
      .catch((error) => {
        throw new Error("Fall call api hub");
      });
    const responseBody = responseAiHub.data;
    if (responseBody && responseBody.hasOwnProperty("data")) {
      const responseDocumentsId = responseBody.documentsId;
      const responseBodyData = responseAiHub.data.data;
      const parsedData = parseMermaidToJson(
        responseBodyData,
        values.prompt || "",
        values.type,
        responseDocumentsId || [],
        values.orgId,
        requestBody.document || {}
      );
      const levelZeroNodes = (await parsedData).nodes.filter(
        (node) => node.level === 0
      );
      if (levelZeroNodes.length == 1) {
        return parsedData;
      } else {
        count++;
        continue;
      }
    } else {
      count++;
    }
  } while (count < countLimit);
  if (values.type === MindmapType.SUMMARY) {
    throw new Error(
      "Error call api ai hub with " + values.type + " docType " + values.docType
    );
  } else {
    throw new Error("Error call api ai hub with " + values.type);
  }
};
export function getFileNameFromUrl(url: string): string {
  const parts = url.split("/");
  const fileNameWithExtension = parts.pop()?.split("?")[0] || "";
  return fileNameWithExtension;
}

export const handleCallApiDeleteDocumentsId = (documentsId: string[]) => {
  const url = `${baseUrl}/mindmap/delete-docs`;
  const requestAi = {
    ids: documentsId,
  };
  axios
    .patch(url, requestAi, {
      headers: {
        "Content-Type": "application/json",
      },
      validateStatus: function (status: number) {
        return status >= 200 && status < 300;
      },
    })
    .catch(() => { });
};

export const mindmapService = new MindmapService();
