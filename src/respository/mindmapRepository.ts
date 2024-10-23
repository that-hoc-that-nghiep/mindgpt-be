import { MindmapType, RoleChat } from "@/constant";
import {
  ConversationModel,
  EdgesModel,
  MindmapModel,
  NodesModel,
} from "@/model/mindmapModel";
export interface NodeMindmap {
  id: string;
  label: string;
  level: number;
  pos: {
    x: number;
    y: number;
  };
  text_color: string;
  bg_color: string;
  size: {
    width: number;
    height: number;
  };
  note: string;
}
export interface EdgeMindmap {
  id: string;
  from: string;
  to: string;
  name: string;
}

export interface MessageConversation {
  role: RoleChat;
  content: string;
}
export interface MindmapResponeAIHub {
  title: string;
  thumbnail: string;
  prompt: string;
  type: MindmapType;
  nodes: NodeMindmap[];
  edges: EdgeMindmap[];
  documentsId: string[];
  document: {};
  orgId: string;
  conversation: MessageConversation[];
}
export class MindmapRepository {
  createNewMindmap = async (values: MindmapResponeAIHub) => {
    const savedNodes = [];
    for (const node of values.nodes) {
      const resNode = await new NodesModel(node).save();
      savedNodes.push(resNode._id);
    }

    const savedEdges = [];
    for (const edge of values.edges) {
      const resEdge = await new EdgesModel(edge).save();
      savedEdges.push(resEdge._id);
    }
    const resConversation = await new ConversationModel(
      values.conversation
    ).save();

    const conversationId = resConversation._id;

    const resMindmap = await new MindmapModel({
      title: values.title,
      thumbnail: values.thumbnail,
      prompt: values.prompt,
      type: values.type,
      nodes: savedNodes,
      edges: savedEdges,
      document: values.document,
      documentsId: values.documentsId,
      orgId: values.orgId,
      conversation: conversationId,
    }).save();

    const populatedMindmap = await MindmapModel.findById(resMindmap._id)
      .select("-__v")
      .populate({
        path: "nodes",
        select: "-_id -__v",
      })
      .populate({
        path: "edges",
        select: "-_id -__v",
      })
      .populate({
        path: "conversation",
        select: "-_id -__v",
      })
      .exec();
    return populatedMindmap;
  };

  getMindmapsWithPagination = async (skip: number, limit: number) => {
    console.warn(skip + " - " + limit);

    const mindmaps = await MindmapModel.find({})
      .skip(skip)
      .limit(limit)
      .populate({
        path: "nodes",
        select: "-_id -__v",
      })
      .populate({
        path: "edges",
        select: "-_id -__v",
      })
      .populate({
        path: "conversation",
        select: "-_id -__v",
      })
      .exec();

    // Đếm tổng số mindmaps
    const total = await MindmapModel.countDocuments();

    return { mindmaps, total };
  };

  getMindmapsByOrgId = async (skip: number, limit: number, orgId: string) => {
    const mindmaps = await MindmapModel.find({ orgId: orgId })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "nodes",
        select: "-_id -__v",
      })
      .populate({
        path: "edges",
        select: "-_id -__v",
      })
      .populate({
        path: "conversation",
        select: "-_id -__v",
      })
      .exec();

    // Đếm tổng số mindmaps
    const total = await MindmapModel.countDocuments();

    return { mindmaps, total };
  };

  deleteMindmap = async (mindmapId: string) => {
    // Attempt to delete the mindmap with the given ID
    const result = await MindmapModel.deleteOne({ _id: mindmapId });

    // Check if a mindmap was deleted
    if (result.deletedCount === 0) {
      throw new Error(`Mindmap with ID ${mindmapId} not found.`);
    } else {
      return result.acknowledged;
    }
  };
}

export const mindmapRepository = new MindmapRepository();
