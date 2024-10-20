import { Request, Response, RequestHandler } from "express";
import { mindmapService } from "@/service/mindmapService";
import statusCode from "http-status-codes";

export class MindmapController {
  createMindmap: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const data = req.body
      const response = await mindmapService.createMindmap(data);
      res.status(200).json(response);
    } catch (error) {
      res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: error });
    }
  };
}

export const mindmapController = new MindmapController();
