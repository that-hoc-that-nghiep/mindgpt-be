import { DocumentTypeRequest, FILE_LIMITS, OrgSubscription } from "@/constant";
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
  SummaryRequestAI,
} from "./types.ts/createMindmap.types";
import { Organization } from "./authService";
import { unlink } from "fs/promises";

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
  async createMindmap(values: CreateRequest) {
    let responseAiHub = null;
    const baseUrl = config.API_AI_HUB;
    const url = `${baseUrl}/mindmap/create`;
    try {
      const countLimit = 3;
      let count = 1;
      const requestAI: CreativeRequestAI = {
        llm: values.llm,
        type: values.type,
        prompt: values.prompt || "",
        depth: values.depth,
        child: values.child,
      };
      do {
        responseAiHub = await axios.post(url, requestAI, {
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
          validateStatus: function (status: number) {
            return status >= 200 && status < 300;
          },
        });

        const responseBody = responseAiHub.data;
        if (responseBody && responseBody.hasOwnProperty("data")) {
          const responseBodyData = responseAiHub.data.data;
          const parsedData = parseMermaidToJson(
            responseBodyData,
            values.prompt || "",
            values.type,
            [],
            values.orgId
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
      const errorMessage = `Error creating new mindmap: ${
        (error as Error).message
      }`;
      console.log(errorMessage);
      throw new Error(errorMessage);
    }
  }

  async createNewMindmapByUploadFile(
    values: CreateMinmapByUploadFileRequest,
    filePdf: any
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
        llm: values.llm,
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

  async getMindmapsWithPagination(
    page: number,
    orgId: string
  ): Promise<{
    mindmaps: any[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    const limit = 5; // 5 maps 1 trang
    if (page < 1) page = 1;
    const skip = (page - 1) * limit;

    const { mindmaps, total } = await this.mindmapRepository.getMindmapsByOrgId(
      skip,
      limit,
      orgId
    );

    return {
      mindmaps,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  async deleteMindmap(mindmapId: string) {
    const result = await this.mindmapRepository.deleteMindmap(mindmapId);
    return result;
  }
}

export const validatePackageOrg = (
  file: Express.Multer.File,
  orgInfo?: Organization
) => {
  const packageOrg = orgInfo?.subscription;
  const sizePackegeOrg = FILE_LIMITS[packageOrg as OrgSubscription];
  if (file.size > sizePackegeOrg) {
    throw new Error(
      `Package ${packageOrg} is limited to ${sizePackegeOrg / (1024 * 1024)} MB`
    );
  }
  return true;
};
export const mindmapService = new MindmapService();
