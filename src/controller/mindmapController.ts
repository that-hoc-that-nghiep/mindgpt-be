import { Request, Response, RequestHandler } from "express";
import { mindmapService } from "@/service/mindmapService";
import statusCode, { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/model/serviceResponse";

export class MindmapController {
  createMindmap: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const data = req.body;
      const serviceResponse = await mindmapService.createMindmap(data);
      res.status(statusCode.OK).json({
        status: statusCode.OK,
        message: "Create mindmap successfully",
        data: serviceResponse,
      });
    } catch (error) {
      const errorMessage = `Error creating new mindmap: ${
        (error as Error).message
      }`;
      console.log(errorMessage);
      res.status(statusCode.INTERNAL_SERVER_ERROR).json({
        status: statusCode.INTERNAL_SERVER_ERROR,
        message: errorMessage,
      });
    }
  };
  createMindmapByUploadFile: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const file = req.file;
      const orgId: string = "f69d607f-1404-4e70-af7c-ec6447854a7e";
      const serviceResponse = await mindmapService.createNewMindmapByUploadFile(
        file,
        orgId
      );
      res.status(statusCode.OK).json({
        status: statusCode.OK,
        message: "Create mindmap by upload file successfully",
        data: serviceResponse,
      });
    } catch (error) {
      const errorMessage = `Error creating new mindmap by upload file: ${
        (error as Error).message
      }`;
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
      const { mindmaps, total, totalPages, currentPage } = await mindmapService.getMindmapsWithPagination(page, orgId);

      res.status(200).json({
        mindmaps,
        total,       // Tổng số mindmap
        totalPages,  // Tổng số trang
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
      res.status(500).json({message: error});
    }
  }
}

export const mindmapController = new MindmapController();
