import { Request } from "express";

export function validateSuggestNoteRequest(req: Request) {
  const { selectedNode } = req.body;
  if (typeof selectedNode !== "object" || selectedNode === null) {
    throw new Error("selectedNode is required and must be an object.");
  }

  if (!selectedNode.id || !selectedNode.name) {
    throw new Error("selectedNode.id and selectedNode.name are required.");
  }
  if (typeof selectedNode.id !== "string" || !selectedNode.id) {
    throw new Error("selectedNode.id is required and must be a string.");
  }

  if (typeof selectedNode.name !== "string" || !selectedNode.name) {
    throw new Error("selectedNode.name is required and must be a string.");
  }

  return {
    selectedNode,
  };
}
