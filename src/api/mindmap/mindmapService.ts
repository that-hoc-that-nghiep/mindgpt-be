import { LLMModel, MindmapType } from "@/constant";
import { MindmapRepository } from "./mindmapRepository";
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

    
}