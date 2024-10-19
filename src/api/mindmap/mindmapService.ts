import { LLMModel, MindmapType } from "@/constant";
import {MindmapRepository, MindmapResponeAIHub } from "./mindmapRepository";
import { logger } from "@/server";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { StatusCodes } from "http-status-codes";
import { parseMermaidToJson } from "@/common/parseData/parseMermaidToJson";
export interface MindmapRequestAiHub {
    llm: LLMModel,
    type: MindmapType,
    prompt: string,
    depth: number,
    child: number
}
export class MindmapService {
    private mindmapRepository: MindmapRepository
    constructor(repository: MindmapRepository = new MindmapRepository()) {
        this.mindmapRepository = repository;
    }

    async createMindmap(values: MindmapRequestAiHub,orgId:string) {
        try{
            const responseAiHub = await fetch( process.env.API_AI_HUB! , {
            method: 'POST', 
            headers: {
            'Content-Type': 'application/json',
            },
         body: JSON.stringify(values), // Replace with the appropriate body data
        });

    if (!responseAiHub.ok) {
    return ServiceResponse.failure("Error creating new mindmap by api aihub", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
    const parsedData = parseMermaidToJson(await responseAiHub.text(), values.prompt, orgId);
    const newMindmap = await this.mindmapRepository.createNewMinmap(await parsedData);
    return ServiceResponse.success("Mindmap created", newMindmap, StatusCodes.OK);
        }catch(error){
            const errorMessage = `Error creating new mindmap: ${(error as Error).message}`;
            logger.error(errorMessage);
            return ServiceResponse.failure(errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
        
    }
}
export const mindmapService = new MindmapService();