import { type Document, type Model, Schema, model } from "mongoose";

interface IConversation {
  role: string;
  content: string;
}

interface IConversationDocument extends IConversation, Document {}

interface IConversationModel extends Model<IConversationDocument> {}

const ConversationSchema: Schema<IConversationDocument> = new Schema({
  role: { type: String, required: true },
  content: { type: String, required: true },
});

const Conversation: IConversationModel = model<IConversationDocument, IConversationModel>(
  "Conversation",
  ConversationSchema,
);

export default Conversation;
