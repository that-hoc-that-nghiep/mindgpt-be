import { type Document, type Model, Schema, model } from "mongoose";

interface IPosition {
  x: number;
  y: number;
}

interface ISize {
  width: number;
  height: number;
}

interface INode {
  node_name: string;
  label: string;
  level: number;
  text_color: string;
  bg_color: string;
  size: ISize;
  note: string;
  pos: IPosition;
}

interface INodeDocument extends INode, Document {}

interface INodeModel extends Model<INodeDocument> {}

const NodeSchema: Schema<INodeDocument> = new Schema({
  node_name: { type: String, required: true },
  label: { type: String, required: true },
  level: { type: Number, required: true },
  text_color: { type: String, required: true },
  bg_color: { type: String, required: true },
  size: {
    width: { type: Number, required: true },
    height: { type: Number, required: true },
  },
  note: { type: String, required: false },
  pos: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
  },
});

const Node: INodeModel = model<INodeDocument, INodeModel>("Node", NodeSchema);

export default Node;
