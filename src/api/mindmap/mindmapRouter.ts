import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express from "express";
import { MindmapSchemaDoc } from "./mindmapModel";
import z from "zod";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { mindmapController } from "./mindmapController";
export const mindmapRegistry = new OpenAPIRegistry();
export const mindmapRouter = express.Router();

mindmapRegistry.registerPath({
    method: "post",
    path: "/mindmap/create",
    tags: ["Mindmap"],
    responses: createApiResponse(z.array(MindmapSchemaDoc), "Success"),
});
mindmapRouter.post("/create", mindmapController.createMindmap)