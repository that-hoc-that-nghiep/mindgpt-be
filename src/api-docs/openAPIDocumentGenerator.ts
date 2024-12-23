import { conversationRegistry } from "@/router/conversationRouter";
import { mindmapRegistry } from "@/router/mindmapRouter";
import { orgRegistry } from "@/router/orgRouter";
import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";

export function generateOpenAPIDocument() {
  const registry = new OpenAPIRegistry([mindmapRegistry, orgRegistry,conversationRegistry]);
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "Swagger API",
    },
    externalDocs: {
      description: "View the raw OpenAPI Specification in JSON format",
      url: "/swagger.json",
    },
  });
}
