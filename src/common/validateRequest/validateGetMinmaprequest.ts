import { Request } from "express";

export function validateGetAllMindmapsRequest(req: Request) {
  const { limit, skip } = req.query;
  const orgId = req.params.orgId;
  let validatedLimit = Number(limit);
  let validatedSkip = Number(skip);

  if (!orgId || typeof orgId !== "string") {
    throw new Error("Expected orgId to be a string");
  }
  //   if (isNaN(validatedLimit) || validatedLimit <= 0) {
  //     validatedLimit = 5;
  //   }

  //   if (isNaN(validatedSkip) || validatedSkip < 0) {
  //     validatedSkip = 0;
  //   }

  return {
    orgId,
    limit: validatedLimit,
    skip: validatedSkip,
    keyword: req.query.keyword as string,
  };
}
