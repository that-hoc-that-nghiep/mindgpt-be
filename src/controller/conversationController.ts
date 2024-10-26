import { Request, Response, RequestHandler } from "express";
import statusCode from "http-status-codes";
import { getBearerToken, getOrgFromUser, getUserInfo, isUserInOrg } from "@/service/authService";
import { conversationService } from "@/service/conversationService";
import { LLM_OrgSubscription, OrgSubscription } from "@/constant";
import { mindmapService } from "@/service/mindmapService";

export class ConversationController {
    createConversation: RequestHandler = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        try {
            const bearerToken = getBearerToken(req);
            const user = await getUserInfo(bearerToken);
            const { orgId, mindmapId } = req.params;
            const values = req.body;
            const mindmap = await mindmapService.getMindmapById(mindmapId);

            if (!mindmap) {
                res.status(statusCode.NOT_FOUND).json({
                    status: statusCode.NOT_FOUND,
                    message: "Mindmap not found",
                });
                return;
            }

            //Check if user is in the organization
            if (!isUserInOrg(user, orgId)) {
                res.status(statusCode.UNAUTHORIZED).json({
                    status: statusCode.UNAUTHORIZED,
                    message: "User is not in the organization",
                });
                return;
            }

            const orgInfo = getOrgFromUser(user, orgId);
            const llmPackage = LLM_OrgSubscription[orgInfo?.subscription as OrgSubscription];

            const serviceResponse = await conversationService.createConversation(values, llmPackage, mindmap);

            res.status(statusCode.OK).json({
                status: statusCode.OK,
                message: "Create conversation successfully",
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

export const conversationController = new ConversationController();