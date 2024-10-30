import express from "express";
import { mindmapController } from "@/controller/mindmapController";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import {
  MindmapGetByIdSchemaDoc,
  MindmapGetSchemaDoc,
  MindmapSchemaDoc,
  QuizDoc,
  SuggestNoteDoc,
} from "@/model/mindmapModel";
import { uploadFileMiddleware } from "@/common/uploadFileHander/upload";

const bodyCreateExampleByCreative = {
  type: "creative",
  prompt: "bão yagi 2024",
  documentsId: [],
  depth: 3,
  child: 3,
  orgId: "f69d607f-1404-4e70-af7c-ec6447854a7e",
};
const bodyCreateExampleByUploadFilePDF = {
  type: "summary",
  filePdf: "test.pdf",
  depth: 3,
  child: 3,
  orgId: "f69d607f-1404-4e70-af7c-ec6447854a7e",
};
const bodyCreateExampleBySummaryPDF = {
  type: "summary",
  docType: "pdf",
  docUrl:
    "https://znacytaqncsguiyhgtgj.supabase.co/storage/v1/object/public/document/Resume_quydx.pdf",
  documentsId: [],
  depth: 3,
  child: 3,
  orgId: "f69d607f-1404-4e70-af7c-ec6447854a7e",
};
const bodyCreateExampleBySummaryWEB = {
  type: "summary",
  docType: "web",
  docUrl:
    "https://dantri.com.vn/giao-duc/nam-sinh-vien-it-gianh-quan-quan-lap-trinh-duoc-dac-cach-tuyen-dung-du-chua-tot-nghiep-20240729151250529.htm",
  documentsId: [],
  depth: 3,
  child: 3,
  orgId: "f69d607f-1404-4e70-af7c-ec6447854a7e",
};
const bodyCreateExampleBySummaryYoutube = {
  type: "summary",
  docType: "youtube",
  docUrl: "",
  documentsId: [],
  depth: 3,
  child: 3,
  orgId: "f69d607f-1404-4e70-af7c-ec6447854a7e",
};
export const mindmapRouter = express.Router();
export const mindmapRegistry = new OpenAPIRegistry();

mindmapRegistry.registerPath({
  method: "post",
  path: "/mindmap/:orgId",
  tags: ["Mindmap"],
  requestBody: {
    content: {
      "multipart/form-data": {
        schema: {
          type: "object",
          properties: {
            type: {
              type: "string",
              description: "Type of the Mindmap. Options: creative, summary",
              example: "creative",
            },
            depth: {
              type: "integer",
              description: "Depth of the Mindmap. greater than 0",
              example: 3,
            },
            child: {
              type: "integer",
              description: "Number of child nodes. greater than 0",
              example: 3,
            },
            prompt: {
              type: "string",
              description: "Prompt for generating the Mindmap",
              example: "bao yagi 2024",
            },
            docType: {
              type: "string",
              description: "Document type. Options: web, pdf, youtube",
              example: "",
            },
            docUrl: {
              type: "string",
              description:
                "Document URL . link web only endpoint is .htm or .html. link pdf only endpoint is .pdf",
              example: "",
            },
            documentsId: {
              type: "string",
              description: "IDs of related documents, in JSON array format",
              example: "[]",
            },
            filePdf: {
              type: "string",
              format: "binary",
              description:
                "File upload for mindmap, only pdf files are allowed, package free default limit size is 5MB",
            },
          },
          required: ["llm", "type", "depth", "child", "orgId", "documentsId"],
        },
      },
      exampleFormData: {
        examples: {
          createByCretive: {
            summary: "Create Mindmap by type creative",
            value: bodyCreateExampleByCreative,
          },
          createByCretivePDF: {
            summary: "Create Mindmap by upload file pdf",
            value: bodyCreateExampleByUploadFilePDF,
          },
          createBySummaryPDF: {
            summary: "Create Mindmap by type summary with link pdf",
            value: bodyCreateExampleBySummaryPDF,
          },
          createBySummaryWEB: {
            summary: "Create Mindmap by type summary with web",
            value: bodyCreateExampleBySummaryWEB,
          },
          createBySummaryYoutube: {
            summary: "Create Mindmap by type summary with youtube",
            value: bodyCreateExampleBySummaryYoutube,
          },
        },
      },
    },
    required: true,
  },
  responses: createApiResponse(MindmapSchemaDoc, "Success"),
});
mindmapRouter.post(
  "/:orgId",
  uploadFileMiddleware().single("filePdf"),
  mindmapController.createMindmap
);

mindmapRegistry.registerPath({
  method: "get",
  description: "Get Mindmap by ID",
  path: "/mindmap/:orgId/:mindmapId",
  tags: ["Mindmap"],
  responses: createApiResponse(MindmapGetByIdSchemaDoc, "Success"),
});
mindmapRouter.get("/:orgId/:mindmapId", mindmapController.getMindmapById);

mindmapRegistry.registerPath({
  method: "get",
  description:
    "Get Mindmap by ID with request query limit, page, keyword. Note that when returning 'all', it includes the set of nodes, edges, and conversations, whereas it only returns a set of objectIds in string format. !",
  path: "/mindmap/:orgId",
  tags: ["Mindmap"],
  responses: createApiResponse(MindmapGetSchemaDoc, "Success"),
});
mindmapRouter.get("/:orgId", mindmapController.getAllMindmaps);

mindmapRegistry.registerPath({
  method: "delete",
  description: "Delete Mindmap by ID",
  path: "/mindmap/:orgId/:mindmapId",
  tags: ["Mindmap"],
  responses: {
    204: {
      description: "Delete mindmap successfully",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              status: {
                type: "number",
                example: 200,
              },
              message: {
                type: "string",
                example: "Delete mindmap successfully",
              },
            },
          },
        },
      },
    },
  },
});
mindmapRouter.delete("/:orgId/:mindmapId", mindmapController.deleteMindmap);

mindmapRegistry.registerPath({
  method: "put",
  description: "Edit Mindmap by AI",
  path: "/mindmap/:orgId/:mindmapId/edit",
  tags: ["Mindmap"],
  requestBody: {
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            prompt: {
              type: "string",
              example: "",
            },
            selectedNodes: {
              type: "string",
              example: "[]",
            },
          },
          required: ["prompt", "selectedNodes"],
        },
      },
    },
  },
  responses: createApiResponse(MindmapSchemaDoc, "Success"),
});

mindmapRouter.put("/:orgId/:mindmapId/edit", mindmapController.editMindmapByAI);

mindmapRegistry.registerPath({
  method: "patch",
  description: "Update Mindmap by ID",
  path: "/mindmap/:orgId/:mindmapId",
  tags: ["Mindmap"],
  requestBody: {
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "title of mindmap",
              example: "new title",
            },
            nodes: {
              type: "array",
              description: "Nodes that client want to update",
              items: {
                type: "object",
                properties: {
                  id: {
                    type: "string",
                    description: "Node ID",
                    example: "B",
                  },
                  label: {
                    type: "string",
                    description: "Node label",
                    example: "new Node",
                  },
                  level: {
                    type: "number",
                    description: "Node level",
                    example: 5,
                  },
                  pos: {
                    type: "object",
                    properties: {
                      x: {
                        type: "number",
                        description: "x position of node",
                        example: 0,
                      },
                      y: {
                        type: "number",
                        description: "y position of node",
                        example: 0,
                      },
                    },
                  },
                  text_color: {
                    type: "string",
                    description: "color of text",
                    example: "#000",
                  },
                  bg_color: {
                    type: "string",
                    description: "color of background",
                    example: "#fff",
                  },
                  size: {
                    type: "object",
                    properties: {
                      width: {
                        type: "number",
                        description: "width of node",
                        example: 120,
                      },
                      height: {
                        type: "number",
                        description: "height of node",
                        example: 80,
                      },
                    },
                  },
                  note: {
                    type: "string",
                    description: "Node note",
                    example: "note of node",
                  },
                },
              },
            },
            edges: {
              type: "array",
              description: "Edges that client want to update",
              items: {
                type: "object",
                properties: {
                  id: {
                    type: "string",
                    description: "Edge ID",
                    example: "A --> B",
                  },
                  from: {
                    type: "string",
                    description: "Node ID from",
                    example: "A",
                  },
                  to: {
                    type: "string",
                    description: "Node ID to",
                    example: "B",
                  },
                  name: {
                    type: "string",
                    description: "Edge name",
                    example: "A --> B",
                  },
                },
              },
            },
            thumbnail: {
              type: "string",
              description: "Thumbnail of updated mindmap",
              example: "",
            },
            note: {
              type: "string",
              description: "Note of mindmap",
              example: "note of mindmap",
            },
          },
          required: ["nodes", "edges"],
        },
      },
    },
  },
  responses: createApiResponse(MindmapSchemaDoc, "Success"),
});

mindmapRouter.patch("/:orgId/:mindmapId", mindmapController.updateMindmap);

mindmapRegistry.registerPath({
  method: "post",
  path: "/mindmap/:orgId/:mindmapId/suggest-note",
  tags: ["Mindmap"],
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            selectedNode: {
              properties: {
                id: {
                  type: "string",
                  description: "Node ID",
                  example: "B",
                },
                name: {
                  type: "string",
                  description: "Node label",
                  example: "Tieu su",
                },
              },
              required: ["id", "label"],
            },
          },
        },
      },
    },
  },
  responses: createApiResponse(SuggestNoteDoc, "Success"),
});
mindmapRouter.post(
  "/:orgId/:mindmapId/suggest-note",
  mindmapController.suggestNoteMindmap
);

mindmapRegistry.registerPath({
  method: "post",
  path: "/mindmap/:orgId/:mindmapId/gen-quiz",
  tags: ["Mindmap"],
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            selectedNodes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: {
                    type: "string",
                    description: "Node ID",
                    example: "B",
                  },
                  name: {
                    type: "string",
                    description: "Node label",
                    example: "Tieu su",
                  },
                },
                required: ["id", "label"],
              },
            },
            questionNumber: {
              type: "number",
              description: "Number of questions",
              example: 5,
            },
          },
        },
      },
    },
  },
  responses: createApiResponse(QuizDoc, "Success"),
});
mindmapRouter.post(
  "/:orgId/:mindmapId/gen-quiz",
  mindmapController.genQuizMindmap
);
