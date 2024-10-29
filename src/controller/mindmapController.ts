import { Request, Response, RequestHandler } from "express";
import { mindmapService, validatePackageOrg } from "@/service/mindmapService";
import statusCode from "http-status-codes";
import {
  getBearerToken,
  getOrgFromUser,
  getUserInfo,
  isUserInOrg,
} from "@/service/authService";
import {
  LLM_OrgSubscription,
  LLMModel,
  MindmapType,
  OrgSubscription,
} from "@/constant";
import { validateMindmapRequest } from "@/common/validateRequest/validateMindmapRequest";
import { unlink } from "fs/promises";
import { validateGetAllMindmapsRequest } from "@/common/validateRequest/validateGetMinmaprequest";
import { validateSuggestNoteRequest } from "@/common/validateRequest/validateSuggestNoteRequest";
import { SuggestNoteRequestBody } from "@/service/types.ts/suggestNoteMindmap.types";
import { validateGenQuizRequest } from "@/common/validateRequest/validateGenQuizRequest";
import { mindmapRepository } from "@/respository/mindmapRepository";

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
        const llmPackage =
          LLM_OrgSubscription[orgInfo?.subscription as OrgSubscription];
        const validatePackageOrgResponse = await validatePackageOrg(
          file,
          orgInfo
        );
        if (validatePackageOrgResponse) {
          const serviceResponse =
            await mindmapService.createNewMindmapByUploadFile(
              values,
              file,
              llmPackage as LLMModel
            );
          res.status(statusCode.OK).json({
            status: statusCode.OK,
            message: "Create mindmap by upload file successfully",
            data: serviceResponse,
          });
        }
      } else if (!file || (file && values.type === MindmapType.CREATIVE)) {
        const orgInfo = getOrgFromUser(user, values.orgId);
        const llmPackage =
          LLM_OrgSubscription[orgInfo?.subscription as OrgSubscription];
        if (file && values.type === MindmapType.CREATIVE) {
          await unlink(file.path);
        }
        const serviceResponse = await mindmapService.createMindmap(
          values,
          llmPackage as LLMModel
        );
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

  getMindmapById: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<any> => {
    try {
      const bearerToken = getBearerToken(req);
      const user = await getUserInfo(bearerToken);
      const { orgId, mindmapId } = req.params;
      if (!isUserInOrg(user, orgId)) {
        res.status(statusCode.UNAUTHORIZED).json({
          status: statusCode.UNAUTHORIZED,
          message: "User is not in the organization",
        });
        return;
      }
      const mindmap = await mindmapService.getMindmapById(mindmapId);
      res.status(statusCode.OK).json({
        status: statusCode.OK,
        message: "Get mindmap by id successfully",
        data: mindmap,
      });
    } catch (error) {
      res.status(statusCode.INTERNAL_SERVER_ERROR).json({
        status: statusCode.INTERNAL_SERVER_ERROR,
        message: (error as Error).message,
      });
    }
  };
  getAllMindmaps: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<any> => {
    try {
      const bearerToken = getBearerToken(req);
      const user = await getUserInfo(bearerToken);
      const values = validateGetAllMindmapsRequest(req);
      if (!isUserInOrg(user, values.orgId)) {
        res.status(statusCode.UNAUTHORIZED).json({
          status: statusCode.UNAUTHORIZED,
          message: "User is not in the organization",
        });
        return;
      }
      const mindmaps = await mindmapService.getAllMindmaps(
        values.orgId,
        values.limit,
        values.page,
        values.keyword
      );
      res.status(statusCode.OK).json({
        status: statusCode.OK,
        message: "Get all mindmaps successfully",
        data: mindmaps,
      });
    } catch (error) {
      res.status(statusCode.INTERNAL_SERVER_ERROR).json({
        status: statusCode.INTERNAL_SERVER_ERROR,
        message: (error as Error).message,
      });
    }
  };

  deleteMindmap: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { mindmapId, orgId } = req.params;
      const bearerToken = getBearerToken(req);
      const user = await getUserInfo(bearerToken);
      if (!isUserInOrg(user, orgId)) {
        res.status(statusCode.UNAUTHORIZED).json({
          status: statusCode.UNAUTHORIZED,
          message: "User is not in the organization",
        });
        return;
      }
      await mindmapService.deleteMindmap(mindmapId);
      res.status(statusCode.OK).json({
        status: statusCode.OK,
        message: "Delete mindmap successfully",
      });
    } catch (error) {
      res.status(statusCode.INTERNAL_SERVER_ERROR).json({
        status: statusCode.INTERNAL_SERVER_ERROR,
        message: (error as Error).message,
      });
    }
  };

  suggestNoteMindmap: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { mindmapId, orgId } = req.params;
      const values = validateSuggestNoteRequest(req);
      const bearerToken = getBearerToken(req);
      const user = await getUserInfo(bearerToken);
      if (!isUserInOrg(user, orgId)) {
        res.status(statusCode.UNAUTHORIZED).json({
          status: statusCode.UNAUTHORIZED,
          message: "User is not in the organization",
        });
        return;
      }
      const orgInfo = getOrgFromUser(user, orgId);
      const llmPackage =
        LLM_OrgSubscription[orgInfo?.subscription as OrgSubscription];
      const newNote = await mindmapService.suggestNoteMindmap(
        mindmapId,
        values,
        llmPackage
      );
      res.status(statusCode.OK).json({
        status: statusCode.OK,
        message: "Suggest note mindmap successfully",
        data: newNote,
      });
    } catch (error) {
      res.status(statusCode.INTERNAL_SERVER_ERROR).json({
        status: statusCode.INTERNAL_SERVER_ERROR,
        message: (error as Error).message,
      });
    }
  };

  genQuizMindmap: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { mindmapId, orgId } = req.params;
      const values = validateGenQuizRequest(req);
      const bearerToken = getBearerToken(req);
      const user = await getUserInfo(bearerToken);
      if (!isUserInOrg(user, orgId)) {
        res.status(statusCode.UNAUTHORIZED).json({
          status: statusCode.UNAUTHORIZED,
          message: "User is not in the organization",
        });
        return;
      }
      const orgInfo = getOrgFromUser(user, orgId);
      const llmPackage =
        LLM_OrgSubscription[orgInfo?.subscription as OrgSubscription];
      const newQuizs = await mindmapService.genQuizMindmap(
        mindmapId,
        values,
        llmPackage
      );
      res.status(statusCode.OK).json({
        status: statusCode.OK,
        message: "Gen quiz mindmap successfully",
        data: newQuizs,
      });
    } catch (error) {
      res.status(statusCode.INTERNAL_SERVER_ERROR).json({
        status: statusCode.INTERNAL_SERVER_ERROR,
        message: (error as Error).message,
      });
    }
  };

  //*
  updateMindmap: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { mindmapId, orgId } = req.params;
      const bearerToken = getBearerToken(req);
      const user = await getUserInfo(bearerToken);
      if (!isUserInOrg(user, orgId)) {
        res.status(statusCode.UNAUTHORIZED).json({
          status: statusCode.UNAUTHORIZED,
          message: "User is not in the organization",
        });
        return;
      }
      const serviceRespons = await mindmapService.updateMindmap(
        mindmapId,
        req.body
      );
      console.log("res ", serviceRespons);
      res.status(statusCode.OK).json({
        status: statusCode.OK,
        message: "Update mindmap successfully",
        data: serviceRespons,
      });
    } catch (error) {
      res.status(statusCode.INTERNAL_SERVER_ERROR).json({
        status: statusCode.INTERNAL_SERVER_ERROR,
        message: (error as Error).message,
      });
    }
  };

  editMindmapByAI: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { mindmapId, orgId } = req.params;
      const bearerToken = getBearerToken(req);
      const user = await getUserInfo(bearerToken);

      if (!isUserInOrg(user, orgId)) {
        res.status(statusCode.UNAUTHORIZED).json({
          status: statusCode.UNAUTHORIZED,
          message: "User is not in the organization",
        });
        return;
      }
      const values = req.body;
      const mindmap = await mindmapRepository.getMindmapById(mindmapId);
      console.log("mindmapID" ,mindmapId);
      console.log("mindmap ", mindmap.conversation);

      if (!mindmap) {
        res.status(statusCode.NOT_FOUND).json({
          status: statusCode.NOT_FOUND,
          message: "Mindmap not found",
        });
        return;
      }

      const orgInfo = getOrgFromUser(user, orgId);
      const llmPackage =
        LLM_OrgSubscription[orgInfo?.subscription as OrgSubscription];

      const serviceResponse = await mindmapService.editMindmapByAI(
        values,
        llmPackage,
        mindmap
      );

      res.status(statusCode.OK).json({
        status: statusCode.OK,
        message: "Edit mindmap by AI successfully",
        data: serviceResponse,
      });
    } catch (error) {
      res.status(statusCode.INTERNAL_SERVER_ERROR).json({
        status: statusCode.INTERNAL_SERVER_ERROR,
        message: (error as Error).message,
      });
    }
  };
}

export const mindmapController = new MindmapController();
