import { DocumentTypeUpload, MindmapType, RoleChat } from "@/constant"
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import mongoose from "mongoose"
import { z } from "zod";

extendZodWithOpenApi(z);
export type IMindmap = z.infer<typeof MindmapSchemaDoc>;
export const MindmapSchemaDoc = z.object({
   title: z.string(),
    thumbnail: z.string(),
    prompt: z.string(),
    document: z.object({
        type: z.string(),
        url: z.string(),
    }) ,
    type: z.string(),
    nodes: z.string(),
    edges: z.string(),
    documentIds:z.string().array(),
    orgId:z.string(),
    conversation: z.string().array(),
})
const ConversationSchema = new mongoose.Schema({
    role:{
        type: [String, "Role is String"],
    },
    content:{
        type: [String, "Content is String"],
    }
})
const NodesSchema = new mongoose.Schema({
    id: {
        type: [String, "id is String"],
        required: [true, "id is required"],
    },
    label: {
        type: [String, "label is String"],
        required: [true, "label is required"],
    },
    level: {
        type: [Number, "level is Number"],
        required: [true, "level is required"],
    },
    pos: {
        x: {
            type: [Number, "x is Number"],
            required: [true, "x is required"],
            default: 0
        },
        y: {
            type: [Number, "y is Number"],
            required: [true, "y is required"],
            default: 0
        },
    },
    text_color: {
        type: [String, "text_color is String"],
        required: [true, "text_color is required"],
        default: "#000"
    },
    bg_color: {
        type: [String, "bg_color is String"],
        required: [true, "bg_color is required"],
        default: "#fff"
    },
    size: {
        width: {
            type: [Number, "width is Number"],
            required: [true, "width is required"],
            default: 120
        },
        height: {
            type: [Number, "height is Number"],
            required: [true, "height is required"],
            default: 80
        },
    },
    note: {
        type: [String, "note is String"],
        required: [false, "note is required"],
    },
})

const EdgesSchema = new mongoose.Schema({
    id:{
        type: [String, "id is String"],
        required: [true, "id is required"],
    },
    from: {
        type: [String, "from is String"],
        required: [true, "from is required"],
    },
    to: {
        type: [String, "to is String"],
        required: [true, "to is required"],
    },
    name: {
        type: [String, "name is String"],
        required: [true, "name is required"],
    },
})

const MindmapSchema = new mongoose.Schema({
    title: {
        type: [String, "title is String"],
        required: [true, "title is required"],
    },
    thumbnail: {
        type: [String, "thumbnail is String"],
        default: "",
    },
    prompt: {
        type: [String, "prompt is String"],
        default: "",
    },
    document: {
        type: {
            type: [String, "type is String"],
            default: DocumentTypeUpload.PDF
        },
        url: {
            type: [String, "url is String"],
        },
    }
    ,
    type: {
        type: [String, "type is String"],
        required: [true, "type is required"],
    },
    nodes: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Nodes"
    },
    edges: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Edges"
    },
    documentIds:[{
        type: [String, "documentId is String"],
        default: []
    }],
    orgId:{
        type: String,
        default: ""
    },
    conversation: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation"
    }]
})
export const ConversationModel = mongoose.model("Conversation", ConversationSchema)
export const NodesModel = mongoose.model("Nodes", NodesSchema)
export const EdgesModel = mongoose.model("Edges", EdgesSchema)
export const MindmapModel = mongoose.model("Mindmaps", MindmapSchema)