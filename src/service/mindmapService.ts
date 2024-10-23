import {
  DocumentTypeRequest,
  FILE_LIMITS,
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
    try {
      const parseDocumentsId =
        values.documentsId?.replace(/[\[\]\"]/g, "").split(",") || [];
      if (parseDocumentsId.length === 1 && parseDocumentsId[0] === "") {
        parseDocumentsId.length = 0; // Chuyển thành mảng rỗng
      }
      switch (values.type) {
        case MindmapType.CREATIVE:
          const requestAI: CreativeRequestAI = {
            llm: values.llm,
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
                llm: values.llm,
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
                llm: values.llm,
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
                llm: values.llm,
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
      return parsedData;
    } else {
      count++;
    }
  } while (count < countLimit);
  throw new Error("Error handler create mindmap");
};

export const mindmapService = new MindmapService();
