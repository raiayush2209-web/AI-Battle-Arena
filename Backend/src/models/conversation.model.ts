import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

interface AIResponse { model: string; response: string; }
interface JudgeResponse { model: string; winner: string; explanation: string; }
interface ConversationMessage {
  role: "user" | "assistant";
  content?: string;
  ai1?: AIResponse;
  ai2?: AIResponse;
  judge?: JudgeResponse;
  createdAt: Date;
}

export interface IConversation extends Document {
  userId: Types.ObjectId;
  title: string;
  pinned: boolean;
  messages: ConversationMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const aiResponseSchema = new Schema<AIResponse>(
  { model: { type: String, required: true, trim: true }, response: { type: String, required: true } },
  { _id: false }
);
const judgeResponseSchema = new Schema<JudgeResponse>(
  {
    model: { type: String, required: true, trim: true },
    winner: { type: String, required: true, trim: true },
    explanation: { type: String, required: true },
  },
  { _id: false }
);
const messageSchema = new Schema<ConversationMessage>(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String },
    ai1: { type: aiResponseSchema },
    ai2: { type: aiResponseSchema },
    judge: { type: judgeResponseSchema },
    createdAt: { type: Date, required: true, default: Date.now },
  },
  { _id: true }
);

const conversationSchema = new Schema<IConversation>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, default: "New Battle" },
    pinned: { type: Boolean, required: true, default: false },
    messages: { type: [messageSchema], default: [] },
  },
  { timestamps: true }
);

conversationSchema.index({ userId: 1, updatedAt: -1 });

const ConversationModel: Model<IConversation> =
  mongoose.models.Conversation || mongoose.model<IConversation>("Conversation", conversationSchema);

export default ConversationModel;
