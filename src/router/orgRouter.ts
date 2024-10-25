import express from "express";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { orgController } from "@/controller/orgController";
export const orgRegistry = new OpenAPIRegistry();
export const orgRouter = express.Router();
orgRegistry.registerPath({
  method: "delete",
  description: "Delete Organization",
  path: "/org/:orgId",
  tags: ["Organization"],
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
                example: "Delete organization successfully",
              },
            },
          },
        },
      },
    },
  },
});
orgRouter.delete("/:orgId", orgController.deleteOrg);
