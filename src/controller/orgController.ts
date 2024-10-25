import {
  getBearerToken,
  getOrgFromUser,
  getUserInfo,
  isUserInOrg,
} from "@/service/authService";
import { orgService } from "@/service/orgService";
import { Request, Response, RequestHandler } from "express";
import statusCode from "http-status-codes";

export class OrgController {
  deleteOrg: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
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
      const orgInfo = getOrgFromUser(user, orgId);
      if (!orgInfo?.is_owner) {
        throw new Error("Only owner can delete organization");
      }
      orgService.deleteOrg(orgId, bearerToken);
      res.status(statusCode.OK).json({
        status: statusCode.OK,
        message: "Delete organization successfully",
      });
    } catch (error) {
      const errorMessage = `${(error as Error).message}`;
      console.log(errorMessage);
      res.status(statusCode.INTERNAL_SERVER_ERROR).json({
        status: statusCode.INTERNAL_SERVER_ERROR,
        message: errorMessage,
      });
    }
  };
}
export const orgController = new OrgController();
