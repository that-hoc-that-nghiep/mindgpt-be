import { Request } from "express";

export function validateGenQuizRequest(req: Request) {
  const { selectedNodes, questionNumber } = req.body;

  if (selectedNodes === undefined) {
    throw new Error("selectedNodes is required.");
  }
  if (questionNumber === undefined) {
    throw new Error("questionNumber is required.");
  }

  if (!Array.isArray(selectedNodes)) {
    throw new Error("selectedNodes is required and must be an array.");
  }
  if (selectedNodes.length === 0) {
    throw new Error("selectedNodes must contain at least one node.");
  }
  selectedNodes.forEach((node, index) => {
    if (typeof node !== "object" || node === null) {
      throw new Error(
        `Node at position ${index + 1} in selectedNodes must be an object.`
      );
    }
    if (typeof node.id !== "string" || !node.id || node.id.trim() === "") {
      throw new Error(
        `Node at position ${
          index + 1
        } in selectedNodes must have an 'id' property of type string and must not be empty.`
      );
    }
    if (
      typeof node.name !== "string" ||
      !node.name ||
      node.name.trim() === ""
    ) {
      throw new Error(
        `Node at position ${
          index + 1
        } in selectedNodes must have a 'name' property of type string and must not be empty.`
      );
    }
  });
  if (
    typeof questionNumber !== "number" ||
    questionNumber < 1 ||
    questionNumber > 10
  ) {
    throw new Error("questionNumber must be a number between 1 and 10.");
  }
  return { selectedNodes };
}
