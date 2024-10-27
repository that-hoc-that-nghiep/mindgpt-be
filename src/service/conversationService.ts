import { convertJsonToMermaid } from "@/common/parseData/convertJsonToMermaid";
import { ConversationRepository } from "@/respository/conversationRepository";
import axios from 'axios';
import config from "config";

const baseUrl = config.API_AI_HUB;
const url = `${baseUrl}/mindmap/chat`;

export class ConversationService {
    private conversationRepository: ConversationRepository;
    constructor(repository: ConversationRepository = new ConversationRepository()) {
        this.conversationRepository = new ConversationRepository();
    }
    createConversation = async (values: any, llmPackage: any, mindmap: any) => {
        try {
            const mermaid = convertJsonToMermaid(mindmap.nodes, mindmap.edges);
            const requestAIConversation = {
                llm: llmPackage,
                type: mindmap.type,
                document: mindmap.document,
                documentsId: mindmap.documentsId,
                mermaid: mermaid,
                prompt: values.prompt,
                conversation: [
                    {
                        "role": "user",
                        "content": "Kết thúc mỗi câu trả lời hãy thêm từ Thưa chủ nhân"
                    },
                    {
                        "role": "ai",
                        "content": "Tôi đã hiểu. Thưa chủ nhân"
                    }
                ],
                selectedNodes: values.selectedNodes
            }
            const response = await axios.post(url, requestAIConversation);

            const conversation = await this.conversationRepository.createNewConversation(
                mindmap.id,
                values.prompt,
                response.data.data
            )

            return response.data.data;

        } catch (error) {
            throw new Error("Error creating new conversation");
        }
    };
    getConversationOfMindmap = async (mindmapId: string) => {
        try {
            const conversation = await this.conversationRepository.findConversationOfMindmap(mindmapId);
            return conversation;
        } catch (error) {
            throw new Error("Error getting conversation of mindmap");
        }
    }
}

export const conversationService = new ConversationService();