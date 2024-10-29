import { MindmapType, MindmapUpdateType, RoleChat } from "@/constant";
import {
  ConversationModel,
  EdgesModel,
  MindmapModel,
  NodesModel,
} from "@/model/mindmapModel";
import { UpdateRequest } from "@/service/types.ts/createMindmap.types";
import { ConversationRepository } from "./conversationRepository";
const mongoose = require("mongoose");
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
    try {
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
    } catch (error) {
      const errorMessage = `Error creating new mindmap in mongodb: ${
        (error as Error).message
      }`;
      console.log(errorMessage);
      throw new Error(errorMessage);
    }
  };

  getAllMindmaps = async (
    orgId: string,
    limit: number,
    page: number,
    keyword?: string
  ) => {
    try {
      const filter: Record<string, any> = {
        orgId: orgId,
      };
      if (keyword) {
        filter.title = { $regex: keyword, $options: "i" };
      }
      const skip = (page - 1) * limit;
      const mindmaps = await MindmapModel.find(filter)
        .skip(skip)
        .limit(limit)
        .select("-__v");

      const total = await MindmapModel.countDocuments(filter);
      return { mindmaps, total };
    } catch (error) {
      throw new Error("Get all mindmaps faild");
    }
  };

  getMindmapById = async (mindmapId: string) => {
    try {
      const mindmap = await MindmapModel.findById(mindmapId)
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

      if (mindmap === null) {
        throw new Error(`Mindmap with ID ${mindmapId} not found.`);
      }
      return mindmap;
    } catch (error) {
      throw new Error(`Mindmap with ID ${mindmapId} not found.`);
    }
  };

  deleteMindmap = async (mindmapId: string) => {
    try {
      const mindmap = await MindmapModel.findById(mindmapId);

      const mindmapResult = await MindmapModel.deleteOne({ _id: mindmap?._id });
      if (!mindmapResult.acknowledged) {
        throw new Error("Fail to delete mindmap.");
      }

      const checkAcknowledged = (result: any, errorMessage: string) => {
        if (!result.acknowledged) {
          throw new Error(errorMessage);
        }
      };

      const [nodeResult, edgeResult, conversationResult] = await Promise.all([
        NodesModel.deleteMany({ _id: { $in: mindmap?.nodes } }),
        EdgesModel.deleteMany({ _id: { $in: mindmap?.edges } }),
        ConversationModel.deleteMany({ _id: { $in: mindmap?.conversation } }),
      ]);

      checkAcknowledged(nodeResult, "Fail to delete nodes.");
      checkAcknowledged(edgeResult, "Fail to delete edges.");
      checkAcknowledged(conversationResult, "Fail to delete conversation.");
      return true;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "CastError" && (error as any).kind === "ObjectId") {
          throw new Error(`Invalid mindmap ID: ${mindmapId}`);
        }
        throw new Error(
          `Error deleting mindmap and related data: ${error.message}`
        );
      } else {
        throw new Error("An unknown error occurred");
      }
    }
  };

  updateMindmap = async (mindmapId: string, values: UpdateRequest) => {
    try {
      const mindmap = await MindmapModel.findById(mindmapId);
      if (!mindmap) {
        throw new Error(`Mindmap with ID ${mindmapId} not found. 2`);
      }

      const nodeIds = mindmap.nodes.map((node) => node._id);
      await NodesModel.deleteMany({ _id: { $in: nodeIds } });

      const edgeIds = mindmap.edges.map((edge) => edge._id);
      await EdgesModel.deleteMany({ _id: { $in: edgeIds } });

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

      const updatedMindmap = await MindmapModel.findByIdAndUpdate(
        mindmapId,
        {
          nodes: savedNodes,
          edges: savedEdges,
          title: values.title,
          thumbnail: values.thumbnail,
        },
        {
          new: true,
          runValidators: true,
        }
      );
      return updatedMindmap;
    } catch (error) {
      throw new Error(`Mindmap with ID ${mindmapId} update failed.`);
    }
  };

  editMindmapByAI = async (
    prompt: string,
    messageAI: string,
    mindmapId: string,
    newJsonMindmap: any
  ) => {
    try {
      //Save conversation to DB
      const conversationRepository = new ConversationRepository();
      const conversation = await conversationRepository.createNewConversation(
        mindmapId,
        prompt,
        messageAI
      );

      //Save mindmap to DB
      const mindmap = await MindmapModel.findById(mindmapId);
      if (!mindmap) {
        throw new Error(`Mindmap with ID ${mindmapId} not found. 2`);
      }
      const updateNodes = [];
      for (const node of newJsonMindmap.nodes) {
        const updatedNode = await NodesModel.findOneAndUpdate(
          { id: node.id, _id: { $in: mindmap.nodes } },
          node,
          { new: true, upsert: true }
        );
        if (!updatedNode) {
          throw new Error(`Node with ID ${node.id} not found.`);
        } else {
          updateNodes.push(updatedNode._id);
        }
      }

      const updateEdges = [];
      for (const edge of newJsonMindmap.edges) {
        const updatedEdge = await EdgesModel.findOneAndUpdate(
          { id: edge.id },
          edge,
          { new: true, upsert: true }
        );
        if (!updatedEdge) {
          throw new Error(`Edge with ID ${edge.id} not found.`);
        } else {
          updateEdges.push(updatedEdge._id);
        }
      }

      const updatedMindmap = await MindmapModel.findByIdAndUpdate(
        mindmapId,
        {
          nodes: updateNodes,
          edges: updateEdges,
        },
        {
          new: true,
          runValidators: true,
        }
      );

      return updatedMindmap;
    } catch (error) {
      throw new Error(`Mindmap with ID ${mindmapId} not found 1.`);
    }
  };
}

export const mindmapRepository = new MindmapRepository();
