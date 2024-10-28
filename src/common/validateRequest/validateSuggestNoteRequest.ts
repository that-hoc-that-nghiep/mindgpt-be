import { Request } from "express";

export function validateSuggestNoteRequest(req: Request) {
  const { selectedNode } = req.body;
  if (typeof selectedNode !== "object" || selectedNode === null) {
    throw new Error("selectedNode is required and must be an object.");
  }

  if (
    typeof selectedNode.id !== "string" ||
    !selectedNode.id ||
    selectedNode.id.trim() === ""
  ) {
    throw new Error(
      "selectedNode.id is required and must be a string and not empty."
    );
  }

  if (
    typeof selectedNode.name !== "string" ||
    !selectedNode.name ||
    selectedNode.name.trim() === ""
  ) {
    throw new Error(
      "selectedNode.name is required and must be a string and not empty."
    );
  }

  return {
    selectedNode,
  };
}
