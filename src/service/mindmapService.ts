import { LLMModel, MindmapType } from "@/constant"
import axios from "axios"
import { MindmapRepository } from "@/respository/mindmapRepository"
import { ServiceResponse } from "@/common/model/serviceResponse"
import { parseMermaidToJson } from "@/common/parseData/parseMermaidToJson"
import { createClient } from "@supabase/supabase-js"
import { StatusCodes } from "http-status-codes"
export interface MindmapRequestAiHub {
    llm: LLMModel
    type: MindmapType
    prompt: string
    documentsId: string[]
    depth: number
    child: number
    orgId: string
}
//const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);
export class MindmapService {
    private mindmapRepository: MindmapRepository
    constructor(repository: MindmapRepository = new MindmapRepository()) {
        this.mindmapRepository = repository
    }
    async createMindmap(values: MindmapRequestAiHub) {
        console.log(values)
        let responseAiHub = null
        const orgId = values.orgId
        try {
            responseAiHub = await axios.post(process.env.API_AI_HUB!, values, {
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                },
                timeout: 60000,
                validateStatus: function (status: number) {
                    return status >= 200 && status < 300 // default
                },
            })
            console.log(responseAiHub.data)
        } catch (error: any) {
            console.log("Error", error.message)
        }

        if (!responseAiHub) {
            throw new Error("Failed to get response from AI Hub")
        }
        const responseBody = responseAiHub.data.data
        const parsedData = parseMermaidToJson(
            responseBody,
            values.prompt,
            orgId
        )
        //Write code to save to mongoDB

        return parsedData
    }
}

export const mindmapService = new MindmapService()
