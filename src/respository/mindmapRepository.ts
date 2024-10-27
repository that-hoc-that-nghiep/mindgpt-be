import { MindmapType, MindmapUpdateType, RoleChat } from "@/constant";
import {
  ConversationModel,
  EdgesModel,
  MindmapModel,
  NodesModel,
} from "@/model/mindmapModel";
import { UpdateRequest } from "@/service/types.ts/createMindmap.types";
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
      for (const node of values.nodes) {
        switch (node.type_update) {
          case MindmapUpdateType.CREATE: {
            const { type_update, referNode, ...saveNode } = node;
            // console.log(saveNode);
            const referNodeData = await NodesModel.findOne({
              id: referNode,
              _id: { $in: mindmap.nodes },
            });
            if (referNodeData) {
              saveNode.level = referNodeData.level + 1;
            } else {
              throw new Error("Refer node not found");
            }
            const newNode = await new NodesModel(saveNode).save();
            await MindmapModel.findByIdAndUpdate(mindmapId, {
              $push: { nodes: newNode._id },
            });
            if (referNode != "") {
              const newEdge = await new EdgesModel({
                id: `${referNode} --> ${saveNode.id}`,
                from: referNode,
                to: saveNode.id,
                name: `${referNode} --> ${saveNode.id}`,
              }).save();
              // console.log("New edge saved:", newEdge);
              await MindmapModel.findByIdAndUpdate(mindmapId, {
                $push: { edges: newEdge._id },
              });
            }

            return newNode;
          }
          case MindmapUpdateType.EDIT: {
            const finededNode = await NodesModel.findOne({
              id: node.id,
              _id: { $in: mindmap.nodes },
            }).exec();
            // console.log(finededNode?._id);
            if (!finededNode) {
              throw new Error(`Node with ID ${node.id} not found.`);
            } else {
              const { type_update, referNode, ...saveNode } = node;
              // console.log(saveNode);
              const updatedNode = await NodesModel.findOneAndUpdate(
                { _id: finededNode._id },
                saveNode
              );
              if (!updatedNode) {
                throw new Error(`Node with ID ${node.id} not found.`);
              }
            }
            break;
          }

          case MindmapUpdateType.DELETE: {
            const finededNode = await NodesModel.findOne({
              id: node.id,
              _id: { $in: mindmap.nodes },
            }).exec();
            console.log(finededNode);
            if (!finededNode) {
              throw new Error(`Node with ID ${node.id} not found.`);
            } else {
              mindmap.nodes = mindmap.nodes.filter(
                (n) => !n.equals(finededNode._id)
              );
              await MindmapModel.findByIdAndUpdate(
                mindmapId,
                { nodes: mindmap.nodes },
                { new: true, runValidators: true }
              );
              console.log(finededNode);
            }
          }
        }
      }
    } catch (error) {
      throw new Error(`Mindmap with ID ${mindmapId} not found 1.`);
    }
  };
}

export const mindmapRepository = new MindmapRepository();
