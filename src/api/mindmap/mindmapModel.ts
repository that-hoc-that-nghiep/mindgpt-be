import { DocumentTypeUpload, MindmapType, RoleChat } from "@/constant"
import mongoose from "mongoose"
const ConversationSchema = new mongoose.Schema({
    role:{
        type: [String, "Role is String"],
        enum: [Object.values(RoleChat), "Role is not valid. Role is: " + Object.values(RoleChat)]
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
            enum: [Object.values(DocumentTypeUpload), "type is not valid. type is: " + Object.values(DocumentTypeUpload)],
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
        enum: [Object.values(MindmapType), "type is not valid. type is: " + Object.values(MindmapType)]
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