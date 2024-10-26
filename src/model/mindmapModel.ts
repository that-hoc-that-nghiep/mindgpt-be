import mongoose from "mongoose";
import z from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
extendZodWithOpenApi(z);
export type IMindmap = z.infer<typeof MindmapSchemaDoc>;
export const NodesSchemaDoc = z.object({
  id: z.string(),
  label: z.string(),
  level: z.number(),
  pos: z.object({
    x: z.number(),
    y: z.number(),
  }),
  text_color: z.string(),
  bg_color: z.string(),
  size: z.object({
    width: z.number(),
    height: z.number(),
  }),
  note: z.string(),
});

export const EdgeSchemaDoc = z.object({
  id: z.string(),
  from: z.string(),
  to: z.string(),
  name: z.string(),
});
export const MessageConversationDoc = z.object({
  role: z.string(),
  content: z.string(),
});

export const MindmapGetSchemaDoc = z.object({
  mindmaps: z.object({
    document: z.object({
      type: z.string(), // e.g. "pdf"
      url: z.string().url(), // URL to the document
    }),
    _id: z.string(), // MongoDB ID or similar
    title: z.string(), // Title of the mindmap
    thumbnail: z.string().optional(), // Thumbnail can be an empty string, so optional
    prompt: z.string().optional(), // Prompt field can also be optional
    type: z.string(), // e.g. "summary"
    nodes: z.array(z.string()), // Array of node IDs
    edges: z.array(z.string()), // Array of edge IDs
    documentsId: z.array(z.string()), // Array of document IDs
    orgId: z.string(), // Organization ID
    conversation: z.array(z.string()), // Array of conversation IDs
  }),
  total: z.number().int().min(0), // Total number of mindmaps
});

export const MindmapGetByIdSchemaDoc = z.object({
  document: z.object({
    type: z.string(), // e.g. "pdf"
    url: z.string().url(), // URL to the document
  }),
  _id: z.string(), // MongoDB ID or similar
  title: z.string(), // Title of the mindmap
  thumbnail: z.string().optional(), // Thumbnail can be an empty string, so optional
  prompt: z.string().optional(), // Prompt field can also be optional
  type: z.string(), // e.g. "summary"
  nodes: z.array(NodesSchemaDoc),
  edges: z.array(EdgeSchemaDoc),
  documentsId: z.array(z.string()), // Array of document IDs
  orgId: z.string(), // Organization ID
  conversation: z.array(MessageConversationDoc),
});

export const MindmapSchemaDoc = z.object({
  _id: z.string(),
  title: z.string(),
  thumbnail: z.string(),
  prompt: z.string(),
  document: z.object({
    type: z.string(),
    url: z.string(),
  }),
  type: z.string(),
  nodes: z.array(NodesSchemaDoc),
  edges: z.array(EdgeSchemaDoc),
  documentIds: z.string().array(),
  orgId: z.string(),
  conversation: z.array(MessageConversationDoc),
});

const ConversationSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["user", "ai"],
  },
  content: {
    type: String,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
}, { versionKey: false });

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
    },
    y: {
      type: Number,
      required: [true, "y is required"],
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
