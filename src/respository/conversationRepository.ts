import {
    ConversationModel,
    MindmapModel,
} from "@/model/mindmapModel";

export class ConversationRepository {
    createNewConversation = async (mindmapId: string, prompt: string, contentAI: string) => {
        try {

            const mindmap = await MindmapModel.findById(mindmapId);

            if (!mindmap) {
                throw new Error("Mindmap not found");
            }

            const conversations = await ConversationModel.insertMany([
                {
                    role: "user",
                    content: prompt,
                },
                {
                    role: "ai",
                    content: contentAI,
                }
            ]);

            mindmap.conversation.push(...conversations.map((conversation) => conversation._id));
           
            await mindmap.save();
            return conversations;


        } catch (error) {
            throw new Error("Error creating new conversation");
        }
    };
}