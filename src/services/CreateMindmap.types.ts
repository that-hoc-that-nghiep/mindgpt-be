import { LLMModel, MindmapType, RoleChat } from "@/constant"

export interface Document{
    type: DocumentType,
    url: string
}
export interface Node{
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
export interface Edge {
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
    document?:Document
    type: MindmapType
    nodes: Node[],
    edges: Edge[]
    conversation:Conversation[]
}
export interface CreateMindmapRequest {
    llm: LLMModel,
    type: MindmapType,
    prompt: string,
    depth: number,
    child: number
}
