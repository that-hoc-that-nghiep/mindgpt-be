import express from "express";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { MessageConversationDoc } from "@/model/mindmapModel"
import { conversationController } from "@/controller/conversationController";

export const conversationRouter = express.Router();
export const conversationRegistry = new OpenAPIRegistry();

conversationRegistry.registerPath({
    method: "post",
    description: "Create Conversation",
    path: "/conversation/:orgId/:mindmapId",
    tags: ["Conversation"],
    requestBody: {
        content: {
            "application/json": {
                schema: {
                    type: "object",
                    properties: {
                        prompt: {
                            type: "string",
                            example:""
                        },
                        selectedNodes: {
                            type: "string",
                            example:"[]"
                        }
                    },
                    required: ["prompt", "selectedNodes"],
                },
            },
        },
    },
    responses: createApiResponse(MessageConversationDoc, "Success"),
});

conversationRouter.post("/:orgId/:mindmapId", conversationController.createConversation);

