import mongoose from "mongoose";
import z from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
extendZodWithOpenApi(z);
export type IMindmap = z.infer<typeof MindmapSchemaDoc>;
export const MindmapSchemaDoc = z.object({
  title: z.string(),
  thumbnail: z.string(),
  prompt: z.string(),
  document: z.object({
    type: z.string(),
    url: z.string(),
  }),
  type: z.string(),
  nodes: z.string(),
  edges: z.string(),
  documentIds: z.string().array(),
  orgId: z.string(),
  conversation: z.string().array(),
});
const ConversationSchema = new mongoose.Schema({
  role: {
    type: String,
  },
  content: {
    type: String,
  },
});
const NodesSchema = new mongoose.Schema({
  id: {
    type: String,
    required: [true, "id is required"],
  },
  label: {
    type: String,
    required: [true, "label is required"],
  },
  level: {
    type: Number,
    required: [true, "level is required"],
  },
  pos: {
    x: {
      type: Number,
      required: [true, "x is required"],
      default: 0,
    },
    y: {
      type: Number,
      required: [true, "y is required"],
      default: 0,
    },
  },
  text_color: {
    type: String,
    required: [true, "text_color is required"],
    default: "#000",
  },
  bg_color: {
    type: String,
    required: [true, "bg_color is required"],
    default: "#fff",
  },
  size: {
    width: {
      type: Number,
      required: [true, "width is required"],
      default: 120,
    },
    height: {
      type: Number,
      required: [true, "height is required"],
      default: 80,
    },
  },
  note: {
    type: String,
    required: false,
  },
});

const EdgesSchema = new mongoose.Schema({
  id: {
    type: String,
    required: [true, "id is required"],
  },
  from: {
    type: String,
    required: [true, "from is required"],
  },
  to: {
    type: String,
    required: [true, "to is required"],
  },
  name: {
    type: String,
    required: [true, "name is required"],
  },
});

const MindmapSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "title is required"],
  },
  thumbnail: {
    type: String,
    default: "",
  },
  prompt: {
    type: String,
    default: "",
  },
  document: {
    type: {
      type: String,
      default: "",
    },
    url: {
      type: String,
      default: "",
    },
    default: {},
  },
  type: {
    type: String,
    required: [true, "type is required"],
  },
  nodes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Nodes",
    },
  ],
  edges: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Edges",
    },
  ],
  documentsId: {
    type: [String],
    default: [],
  },
  orgId: {
    type: String,
    default: "",
  },
  conversation: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
    },
  ],
});
export const ConversationModel = mongoose.model(
  "Conversation",
  ConversationSchema
);
export const NodesModel = mongoose.model("Nodes", NodesSchema);
export const EdgesModel = mongoose.model("Edges", EdgesSchema);
export const MindmapModel = mongoose.model("Mindmaps", MindmapSchema);
