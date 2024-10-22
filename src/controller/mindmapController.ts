import { Request, Response, RequestHandler } from "express";
import { mindmapService, validatePackageOrg } from "@/service/mindmapService";
import statusCode, { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/model/serviceResponse";
import {
  getBearerToken,
  getOrgFromUser,
  getUserInfo,
  isUserInOrg,
} from "@/service/authService";
import {
  FILE_LIMITS,
  MindmapType,
  MinmeTypeFile,
  OrgSubscription,
} from "@/constant";
import multer from "multer";
import { uploadFileMiddleware } from "@/common/uploadFileHander/upload";
import { CreateMinmapByUploadFileRequest } from "@/service/types.ts/createMindmap.types";
import { validateMindmapRequest } from "@/common/validateRequest/validateMindmapRequest";

interface CreateMindMapDto {
  type: MindmapType;
  prompt: string | null;
  document: File | null;
  depth: number;
  child: number;
  orgId: string;
}
const upload = multer();
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
      } else if (!file) {
        res.status(statusCode.OK).json({
          data: {
            values,
          },
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
