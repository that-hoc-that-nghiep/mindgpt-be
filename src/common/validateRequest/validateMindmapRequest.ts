import { DocumentTypeRequest, LLMModel, MindmapType } from "@/constant";
import { Request } from "express";

export function validateMindmapRequest(req: Request) {
  const {
    llm,
    type,
    depth,
    child,
    orgId,
    prompt,
    docType,
    docUrl,
    documentsId,
  } = req.body;
  const depthNum = Number(depth);
  const childNum = Number(child);
  const file = req.file;
  const missingFields = [];

  // Kiểm tra các trường bắt buộc
  if (!orgId) missingFields.push("orgId");
  if (!llm) missingFields.push("llm");
  if (!type) missingFields.push("type");
  if (depth === undefined || depth === null) missingFields.push("depth");
  if (child === undefined || child === null) missingFields.push("child");

  // Điều kiện cho 'creative'
  if (type === MindmapType.CREATIVE) {
    if (!prompt || prompt.trim() === "") {
      missingFields.push("prompt");
    }
    if (!documentsId) missingFields.push("documentsId");
  }

  // Điều kiện cho 'summary'
  if (type === MindmapType.SUMMARY) {
    if (!file) {
      // Nếu không có tệp, yêu cầu docType và docUrl
      if (!docType) missingFields.push("docType");
      if (!docUrl || docUrl.trim() === "") missingFields.push("docUrl");
      if (!documentsId) missingFields.push("documentsId");
    }
  }

  // Nếu có trường bị thiếu, ném lỗi
  if (missingFields.length > 0) {
    throw new Error(
      `Missing fields in request body: ${missingFields.join(", ")}`
    );
  }

  // Kiểm tra chi tiết từng điều kiện
  const validTypes = Object.values(MindmapType);
  if (!validTypes.includes(type)) {
    throw new Error(
      `Invalid value for type. Expected one of: ${validTypes.join(", ")}`
    );
  }

  const validLlmTypes = Object.values(LLMModel);
  if (!validLlmTypes.includes(llm)) {
    throw new Error(
      `Invalid value for llm. Expected one of: ${validLlmTypes.join(", ")}`
    );
  }

  if (typeof orgId !== "string") {
    throw new Error("Invalid value for orgId. Expected a string");
  }

  if (typeof depthNum !== "number" || depthNum < 0) {
    throw new Error(
      "Invalid value for depth. Expected a number greater than 0"
    );
  }

  if (typeof childNum !== "number" || childNum < 0) {
    throw new Error(
      "Invalid value for child. Expected a number greater than 0"
    );
  }

  // Kiểm tra thêm cho 'summary'
  if (type === MindmapType.SUMMARY && !file) {
    // Nếu không có file, kiểm tra docType và docUrl
    const validDocTypes = Object.values(DocumentTypeRequest);
    if (!validDocTypes.includes(docType)) {
      throw new Error(
        `Invalid value for docType. Expected one of: ${validDocTypes.join(
          ", "
        )}`
      );
    }

    if (typeof docUrl !== "string" || docUrl.trim() === "") {
      throw new Error("Invalid value for docUrl. Expected a non-empty string");
    }
    try {
      const documentsIdParseArray = JSON.parse(documentsId);
      if (
        !Array.isArray(documentsIdParseArray) ||
        !documentsIdParseArray.every((item) => typeof item === "string")
      ) {
        throw new Error(
          "Invalid value for documentsId. Expected an array string"
        );
      }
    } catch (e) {
      throw new Error(
        "Invalid value for documentsId. Expected an array string"
      );
    }
  }
  if (type === MindmapType.CREATIVE && !file) {
    try {
      const documentsIdParseArray = JSON.parse(documentsId);
      if (
        !Array.isArray(documentsIdParseArray) ||
        !documentsIdParseArray.every((item) => typeof item === "string")
      ) {
        throw new Error(
          "Invalid value for documentsId. Expected an array string"
        );
      }
    } catch (e) {
      throw new Error(
        "Invalid value for documentsId. Expected an array string"
      );
    }
  }
  // Nếu tất cả đều hợp lệ, trả về thành công (true)
  return { ...req.body };
}
