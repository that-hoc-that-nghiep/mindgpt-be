import { Request, Response, RequestHandler } from "express";
import { mindmapService, validatePackageOrg } from "@/service/mindmapService";
import statusCode from "http-status-codes";
import {
  getBearerToken,
  getOrgFromUser,
  getUserInfo,
  isUserInOrg,
} from "@/service/authService";
import { MindmapType } from "@/constant";
import { validateMindmapRequest } from "@/common/validateRequest/validateMindmapRequest";
import { unlink } from "fs/promises";

export class MindmapController {
  createMindmap: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const bearerToken = getBearerToken(req);
      const user = await getUserInfo(bearerToken);
      const values = validateMindmapRequest(req);
      if (!isUserInOrg(user, values.orgId)) {
        res.status(statusCode.UNAUTHORIZED).json({
          status: statusCode.UNAUTHORIZED,
          message: "User is not in the organization",
        });
        return;
      }
      const file = req.file;
      if (file && values.type === MindmapType.SUMMARY) {
        const orgInfo = getOrgFromUser(user, values.orgId);
        const validatePackageOrgResponse = await validatePackageOrg(
          file,
          orgInfo
        );
        if (validatePackageOrgResponse) {
          const serviceResponse =
            await mindmapService.createNewMindmapByUploadFile(values, file);
          res.status(statusCode.OK).json({
            status: statusCode.OK,
            message: "Create mindmap by upload file successfully",
            data: serviceResponse,
          });
        }
      } else if (!file || (file && values.type === MindmapType.CREATIVE)) {
        if (file && values.type === MindmapType.CREATIVE) {
          await unlink(file.path);
        }
        const serviceResponse = await mindmapService.createMindmap(values);
        res.status(statusCode.OK).json({
          status: statusCode.OK,
          message: "Create mindmap successfully",
          data: serviceResponse,
        });
      }
    } catch (error) {
      const errorMessage = `${(error as Error).message}`;
      console.log(errorMessage);
      res.status(statusCode.INTERNAL_SERVER_ERROR).json({
        status: statusCode.INTERNAL_SERVER_ERROR,
        message: errorMessage,
      });
    }
  };

  getMindmaps: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<any> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const orgId = req.params.orgId as string;
      const { mindmaps, total, totalPages, currentPage } =
        await mindmapService.getMindmapsWithPagination(page, orgId);

      res.status(200).json({
        mindmaps,
        total, // Tổng số mindmap
        totalPages, // Tổng số trang
        currentPage, // Trang hiện tại
      });
    } catch (error) {
      res.status(500).json({ message: error });
    }
  };

  deleteMindmaps: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const mindmapId = req.body.mindmapId;
      const response = await mindmapService.deleteMindmap(mindmapId);
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ message: error });
    }
  };
}

export const mindmapController = new MindmapController();
