import { RequestHandler, Request, Response } from "express";
import { mindmapService } from "./mindmapService";
import { handleServiceResponse } from "@/common/utils/httpHandlers";

export class MindmapController {
    public createMindmap: RequestHandler = async (req: Request, res: Response) => {
        const {llm, type, prompt, depth, child, orgId} = req.body;
        const serviceResponse = await mindmapService.createMindmap({llm, type, prompt, depth, child},orgId);
        return handleServiceResponse(serviceResponse, res);
    }
}
export const mindmapController = new MindmapController();