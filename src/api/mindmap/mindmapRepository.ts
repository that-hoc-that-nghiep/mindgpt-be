
import { DocumentTypeUpload, MindmapType, RoleChat } from "@/constant";
import { ConversationModel, EdgesModel, MindmapModel, NodesModel } from "./mindmapModel";
import mongoose from "mongoose";
export interface NodeMindmap{
    id: string,
    label: string,
    level: number,
    pos: {
        x: number,
        y: number
    },
    text_color: string,
    bg_color: string,
    size: {
        width: number,
        height: number
    },
    note: string
}
export interface EdgeMindmap {
    id: string,
    from: string,
    to: string,
    name: string
}
export interface Conversation{
    role: RoleChat,
    content: string
}
export interface MindmapRespone{
    title: string,
    thumbnail: string,
    prompt: string,
    document?:{
    type: DocumentTypeUpload,
    url: string
    }
    type: MindmapType
    nodes: NodeMindmap[],
    edges: EdgeMindmap[],
    documentsId: string[],
    orgId: string
    conversation: Conversation[]
}
export class MindmapRepository {
    createNewMinmap = async (values: MindmapRespone) => {
    const resNode= await new NodesModel(values.nodes).save()
    const nodeId = resNode._id;
    const resEdge= await new EdgesModel(values.edges).save()
    const edgeId = resEdge._id;
    const resConversation = await new ConversationModel(values.conversation).save()
    const conversationId = resConversation._id;
    const resMindmap =  await new MindmapModel({
        title: values.title,
        thumbnail: values.thumbnail,
        prompt: values.prompt,
        type: values.type,
        nodes: nodeId,
        edges: edgeId,
        document: values.document,
        documentsId: values.documentsId,
        orgId: values.orgId,
        conversation: conversationId
    }).save()
    return resMindmap;
    }
}


export const mindmapRepository = new MindmapRepository;