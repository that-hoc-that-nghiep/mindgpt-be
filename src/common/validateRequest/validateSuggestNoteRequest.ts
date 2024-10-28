import { Request } from "express";
interface SuggestNoteRequestBody {
  selectedNode: {
    id: string;
    name: string;
  };
  documentsId: string[];
}

export function validateSuggestNoteRequest(
  req: Request<{}, {}, SuggestNoteRequestBody>
) {
  const { selectedNode, documentsId } = req.body;
  if (typeof selectedNode !== "object" || selectedNode === null) {
    throw new Error("selectedNode is required and must be an object.");
  }

  if (typeof selectedNode.id !== "string" || !selectedNode.id) {
    throw new Error("selectedNode.id is required and must be a string.");
  }

  if (typeof selectedNode.name !== "string" || !selectedNode.name) {
    throw new Error("selectedNode.name is required and must be a string.");
  }

  if (!Array.isArray(documentsId)) {
    throw new Error("documentsId is required and must be an array of strings.");
  }

  for (const docId of documentsId) {
    if (typeof docId !== "string") {
      throw new Error("Each item in documentsId must be a string.");
    }
  }
  return {
    selectedNode,
    documentsId,
  };
}
