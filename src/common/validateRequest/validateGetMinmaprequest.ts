import { Request } from "express";

export function validateGetAllMindmapsRequest(req: Request) {
  const { limit, page } = req.query;
  const orgId = req.params.orgId;
  let validatedLimit = Number(limit);
  let validatedPage = Number(page);

  if (!orgId || typeof orgId !== "string") {
    throw new Error("Expected orgId to be a string");
  }

  if (limit === undefined || page === undefined) {
    validatedLimit = 5;
    validatedPage = 1;
  }

  if (isNaN(validatedLimit) || validatedLimit < 0) {
    throw new Error(
      "Expected limit to be a positive number, does not contain negative numbers"
    );
  }

  if (isNaN(validatedPage) || validatedPage < 1) {
    throw new Error(
      "Expected page to be a positive number, does not contain negative numbers or 0"
    );
  }

  return {
    orgId,
    limit: validatedLimit,
    page: validatedPage,
    keyword: req.query.keyword as string,
  };
}
