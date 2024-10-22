import express from "express";
import { mindmapController } from "@/controller/mindmapController";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import z from "zod";
import { MindmapSchemaDoc } from "@/model/mindmapModel";
import { uploadFileMiddleware } from "@/common/uploadFileHander/upload";
import multer from "multer";
const bodyCreateExample = {
  type: "creative",
  prompt: "bão yagi 2024",
  documentsId: [],
  document: {},
  depth: 4,
  child: 3,
  orgId: "f69d607f-1404-4e70-af7c-ec6447854a7e",
};
const formDataExample = {
  key: "file",
  value: "",
};
export const mindmapRouter = express.Router();
export const mindmapRegistry = new OpenAPIRegistry();
mindmapRegistry.registerPath({
  method: "post",
  path: "/mindmap/create",
  tags: ["Mindmap"],
  requestBody: {
    content: {
      "multipart/form-data": {
        schema: {
          type: "object",
          properties: {
            llm: {
              type: "string",
              description: "The LLM model to be used",
              example: "GPT-3",
            },
            type: {
              type: "string",
              description: "Type of the Mindmap",
              example: "CREATIVE",
            },
            depth: {
              type: "integer",
              description: "Depth of the Mindmap",
              example: 2,
            },
            child: {
              type: "integer",
              description: "Number of child nodes",
              example: 3,
            },
            orgId: {
              type: "string",
              description: "Organization ID",
              example: "org_123",
            },
            prompt: {
              type: "string",
              description: "Prompt for generating the Mindmap",
              example: "Generate a mindmap for project management",
            },
            docType: {
              type: "string",
              description: "Document type",
              example: "web",
            },
            docUrl: {
              type: "string",
              description: "Document URL (for web document types)",
              example: "https://example.com/file.html",
            },
            documentsId: {
              type: "string",
              description: "IDs of related documents, in JSON array format",
              example: '["doc1", "doc2", "doc3"]',
            },
            filePdf: {
              type: "string",
              format: "binary",
              description: "File upload for mindmap",
            },
          },
          required: ["llm", "type", "depth", "child", "orgId", "documentsId"],
        },
        example: {
          llm: "GPT-3",
          type: "CREATIVE",
          depth: 2,
          child: 3,
          orgId: "org_123",
          prompt: "Generate a mindmap for project management",
          docType: "web",
          docUrl: "https://example.com/file.html",
          documentsId: '["doc1", "doc2", "doc3"]',
        },
      },
    },
    required: true,
  },
  responses: createApiResponse(z.array(MindmapSchemaDoc), "Success"),
});
mindmapRouter.post(
  "/create",
  uploadFileMiddleware().single("filePdf"),
  mindmapController.createMindmap
);

mindmapRouter.get("/:orgId/list-mindmap", mindmapController.getMindmaps);

mindmapRouter.delete("/delete", mindmapController.deleteMindmaps);
