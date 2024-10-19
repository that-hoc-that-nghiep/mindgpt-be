import { type Document, type Model, Schema, Types, model } from "mongoose";

interface IEdge {
  from: string;
  to: string;
  name: string;
}

interface IEdgeDocument extends IEdge, Document {}

interface IEdgeModel extends Model<IEdgeDocument> {}

const EdgeSchema: Schema<IEdgeDocument> = new Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  name: { type: String, required: true },
});

const Edge: IEdgeModel = model<IEdgeDocument, IEdgeModel>("Edge", EdgeSchema);

export default Edge;
