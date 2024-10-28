import { Request } from "express";

export function validateGenQuizRequest(req: Request) {
  const { selectedNodes } = req.body;

  if (!Array.isArray(selectedNodes)) {
    throw new Error("selectedNodes is required and must be an array.");
  }

  selectedNodes.forEach((node, index) => {
    if (typeof node !== "object" || node === null) {
      throw new Error(
        `Item at index ${index} in selectedNodes must be an object.`
      );
    }
    if (typeof node.id !== "string" || !node.id) {
      throw new Error(
        `Item at index ${index} in selectedNodes must have an 'id' property of type string.`
      );
    }
    if (typeof node.name !== "string" || !node.name) {
      throw new Error(
        `Item at index ${index} in selectedNodes must have a 'name' property of type string.`
      );
    }
  });

  return { selectedNodes };
}
