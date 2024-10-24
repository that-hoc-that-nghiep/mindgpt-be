import { validateMindmapRequest } from "@/common/validateRequest/validateMindmapRequest";
import {
  getBearerToken,
  getUserInfo,
  isUserInOrg,
} from "@/service/authService";
import { Request, Response, RequestHandler } from "express";
import statusCode from "http-status-codes";

export class OrgController {
  deleteOrg: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const bearerToken = getBearerToken(req);
    const user = await getUserInfo(bearerToken);
    const { orgId } = req.params;
    if (!isUserInOrg(user, orgId)) {
      res.status(statusCode.UNAUTHORIZED).json({
        status: statusCode.UNAUTHORIZED,
        message: "User is not in the organization",
      });
      return;
    }
  };
}
export const orgController = new OrgController();
