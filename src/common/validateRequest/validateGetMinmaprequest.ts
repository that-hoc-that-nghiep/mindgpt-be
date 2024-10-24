import { Request } from "express";

export function validateGetAllMindmapsRequest(req: Request) {
  const { limit, skip } = req.query;
  const orgId = req.params.orgId;
  let validatedLimit = Number(limit);
  let validatedSkip = Number(skip);

  if (!orgId || typeof orgId !== "string") {
    throw new Error("Expected orgId to be a string");
  }

  if (limit === undefined || skip === undefined) {
    throw new Error("Both 'limit' and 'skip' must be provided");
  }

  if (isNaN(validatedLimit) || validatedLimit <= 0) {
    throw new Error(
      "Expected limit to be a positive number, does not contain negative numbers"
    );
  }

  if (isNaN(validatedSkip) || validatedSkip < 0) {
    throw new Error(
      "Expected limit to be a positive number, does not contain negative numbers"
    );
  }

  return {
    orgId,
    limit: validatedLimit,
    skip: validatedSkip,
    keyword: req.query.keyword as string,
  };
}
