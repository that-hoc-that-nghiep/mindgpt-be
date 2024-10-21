import { LLMModel, MindmapType } from "@/constant";
import axios from "axios";
import { MindmapRepository } from "@/respository/mindmapRepository";
import { ServiceResponse } from "@/common/model/serviceResponse";
import { parseMermaidToJson } from "@/common/parseData/parseMermaidToJson";
import { createClient } from "@supabase/supabase-js";
import { StatusCodes } from "http-status-codes";
import config from "config";
export interface MindmapRequestAiHub {
  llm: LLMModel;
  type: MindmapType;
  prompt: string;
  documentsId: string[];
  depth: number;
  child: number;
  orgId: string;
}
//const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);
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
}

export const mindmapService = new MindmapService();
