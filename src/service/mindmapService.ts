import { DocumentTypeUpload, LLMModel, MindmapType } from "@/constant";
import axios from "axios";
import { MindmapRepository } from "@/respository/mindmapRepository";
import { ServiceResponse } from "@/common/model/serviceResponse";
import { parseMermaidToJson } from "@/common/parseData/parseMermaidToJson";
import { createClient } from "@supabase/supabase-js";
import { StatusCodes } from "http-status-codes";
import config from "config";
import * as fs from "fs/promises";
export interface MindmapRequestAiHub {
  llm: LLMModel;
  type: MindmapType;
  prompt: string;
  documentsId: string[];
  depth: number;
  child: number;
  orgId: string;
}
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);
const baseUrl = config.API_AI_HUB;
const url = `${baseUrl}/mindmap/create`;
export class MindmapService {
  private mindmapRepository: MindmapRepository;
  constructor(repository: MindmapRepository = new MindmapRepository()) {
    this.mindmapRepository = repository;
  }
  async createMindmap(values: MindmapRequestAiHub) {
    let responseAiHub = null;
    const baseUrl = config.API_AI_HUB;
    const url = `${baseUrl}/mindmap/create`;
    try {
      responseAiHub = await axios.post(url, values, {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        validateStatus: function (status: number) {
          return status >= 200 && status < 300;
        },
      });
    } catch (error: any) {
      console.log("Error", error.message);
    }

    if (!responseAiHub) {
      throw new Error("Failed to get response from AI Hub");
    }
    const responseBody = responseAiHub.data;
    const responseBodyData = responseAiHub.data.data;
    const parsedData = parseMermaidToJson(
      responseBodyData,
      values.prompt,
      values.type,
      values.documentsId,
      values.orgId
    );
    const newMindmap = await this.mindmapRepository.createNewMindmap(
      await parsedData
    );
    return newMindmap;
  }

  async createNewMindmapByUploadFile(file: any, orgId: string) {
    try {
      const fileData = await fs.readFile(file.path);
      const dataSupabase = await supabase.storage
        .from("document")
        .upload(file.filename, fileData, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.mimetype,
        });
      const fullPathSupabase: any = dataSupabase.data?.path;
      const linkPublicSupabase = await supabase.storage
        .from("document")
        .getPublicUrl(fullPathSupabase).data.publicUrl;
      const requestAIHubFile = {
        llm: LLMModel.GPT_4o,
        type: MindmapType.SUMMARY,
        document: {
          type: DocumentTypeUpload.PDF,
          url: linkPublicSupabase,
        },
        prompt: "",
        documentsId: [],
        depth: 4,
        child: 3,
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
          const responseDocumentsId: string[] = responseAiHub.data.documentsId;
          const parsedData = parseMermaidToJson(
            responseBodyData,
            requestAIHubFile.prompt,
            requestAIHubFile.type,
            responseDocumentsId,
            orgId,
            requestAIHubFile.document
          );
          const newMindmap = await this.mindmapRepository.createNewMindmap(
            await parsedData
          );
          return newMindmap;
        } else {
          count++;
        }
      } while (count < countLimit);
    } catch (error) {
      const errorMessage = `Error creating new mindmap by upload file: ${
        (error as Error).message
      }`;
      console.log(errorMessage);
      throw new Error(errorMessage);
    }
  }
}

export const mindmapService = new MindmapService();
