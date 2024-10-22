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
      "application/json": {
        example: bodyCreateExample,
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

// mindmapRegistry.registerPath({
//   method: "post",
//   path: "/mindmap/upload",
//   tags: ["Mindmap"],
//   requestBody: {
//     content: {
//       "application/pdf": {
//         example: formDataExample,
//       },
//     },
//   },
//   responses: createApiResponse(z.array(MindmapSchemaDoc), "Success"),
// });

// mindmapRouter.post(
//   "/upload",
//   uploadFileMiddleware("free").single("file"),
//   mindmapController.createMindmapByUploadFile
// );

mindmapRouter.get("/:orgId/list-mindmap", mindmapController.getMindmaps);

mindmapRouter.delete("/delete", mindmapController.deleteMindmaps);
