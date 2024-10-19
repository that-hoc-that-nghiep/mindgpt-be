import { LLMModel, MindmapType } from "@/constant";
import axios from 'axios';
import {MindmapRepository, MindmapResponeAIHub } from "./mindmapRepository";
import { logger } from "@/server";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { StatusCodes } from "http-status-codes";
import { parseMermaidToJson } from "@/common/parseData/parseMermaidToJson";
export interface MindmapRequestAiHub {
    llm: LLMModel,
    type: MindmapType,
    prompt: string,
    documentsId: string[],
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
            const responseAiHub = await axios.post(process.env.API_AI_HUB!, values, {
                headers: {
                    'Content-Type': 'application/json'
                },
            });
         if (responseAiHub.status !== 201) {
            throw new Error(`Failed to fetch from AI Hub, status code: ${responseAiHub.status}`);
      }

       const responseBody = responseAiHub.data.data;
        console.log(responseBody)
    const parsedData = parseMermaidToJson(responseBody, values.prompt, orgId);
    
    // update to databse
    // const newMindmap = await this.mindmapRepository.createNewMinmap(await parsedData);
    return ServiceResponse.success("Mindmap created",parsedData , StatusCodes.OK);
        }catch(error){
            const errorMessage = `Error creating new mindmap: ${(error as Error).message}`;
            logger.error(errorMessage);
            return ServiceResponse.failure(errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
        
    }
}
export const mindmapService = new MindmapService();