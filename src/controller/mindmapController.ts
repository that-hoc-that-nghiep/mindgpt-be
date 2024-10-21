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
}

export const mindmapController = new MindmapController();
