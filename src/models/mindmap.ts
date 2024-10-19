import { type Document, type Model, Schema, type Types, model } from "mongoose";
import type INode from "./node";

interface IMindmapDocument {
  type: string;
  url: string;
}
interface IMindmap {
  title: string;
  thumbnail: string;
  prompt: string;
  type: string;
  summary: string;
  document: IMindmapDocument;
  nodes: Types.ObjectId[] | (typeof INode)[];
}

interface IMindmapDocumentExtends extends IMindmap, Document {}

interface IMindmapModel extends Model<IMindmapDocumentExtends> {}

const MindmapSchema: Schema<IMindmapDocumentExtends> = new Schema({
  title: { type: String, required: true },
  thumbnail: { type: String, required: false },
  prompt: { type: String, required: true },
  type: { type: String, required: true },
  summary: { type: String, required: false },
  document: {
    type: { type: String, required: true },
    url: { type: String, required: true },
  },
  nodes: [{ type: Schema.Types.ObjectId, ref: "Node" }],
});

const Mindmap: IMindmapModel = model<IMindmapDocumentExtends, IMindmapModel>("Mindmap", MindmapSchema);

export default Mindmap;

/**
 * Giải thích:
 * 1. **Interface IMindmapDocument**: Định nghĩa cấu trúc của document cho trường `document` trong Mindmap.
 * 2. **Interface IMindmap**: Định nghĩa các trường cho Mindmap, gồm `title`, `thumbnail`, `prompt`, `type`, `summary`, `document`, và `nodes`.
 * 3. **Trường nodes**: Tham chiếu đến các Node trong `Model Node` với kiểu `Types.ObjectId[]` hoặc `INodeDocument[]`.
 * 4. **Schema MindmapSchema**: Định nghĩa cấu trúc lưu trữ cho Mindmap trong MongoDB.
 */
