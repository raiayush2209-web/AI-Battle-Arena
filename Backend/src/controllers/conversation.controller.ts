import type { Request, Response } from "express";
import type { JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";
import { z } from "zod";
import ConversationModel from "../models/conversation.model.js";

const text = (field: string) => z.string().trim().min(1, `${field} is required`).max(100_000, `${field} is too long`);
const createConversationSchema = z.object({ title: text("Title").max(200, "Title is too long").optional() }).strict();
const assistantSchema = z.object({
  ai1: z.object({ model: text("AI 1 model"), response: text("AI 1 response") }).strict(),
  ai2: z.object({ model: text("AI 2 model"), response: text("AI 2 response") }).strict(),
  judge: z.object({ model: text("Judge model"), winner: text("Judge winner"), explanation: text("Judge explanation") }).strict(),
}).strict();
const addMessageSchema = z.object({ userMessage: text("User message"), assistant: assistantSchema }).strict();
const updateConversationSchema = z.object({
  title: text("Title").max(200, "Title is too long").optional(),
  pinned: z.boolean().optional(),
}).strict().refine((data) => data.title !== undefined || data.pinned !== undefined, { message: "Provide title or pinned to update" });

function getUserId(req: Request): string | null {
  const user = req.user;
  return typeof user === "object" && user !== null && typeof (user as JwtPayload).id === "string"
    ? (user as JwtPayload).id
    : null;
}
function invalidBody(res: Response, error: z.ZodError): Response {
  return res.status(400).json({ success: false, message: error.issues[0]?.message || "Invalid request body" });
}
function validId(req: Request, res: Response): boolean {
  if (typeof req.params.id === "string" && mongoose.isValidObjectId(req.params.id)) return true;
  res.status(400).json({ success: false, message: "Invalid conversation id" });
  return false;
}
function conversationId(req: Request): string {
  return req.params.id as string;
}
function userIdOrUnauthorized(req: Request, res: Response): string | null {
  const userId = getUserId(req);
  if (!userId) res.status(401).json({ success: false, message: "Unauthorized" });
  return userId;
}

export async function createConversation(req: Request, res: Response): Promise<Response> {
  const parsed = createConversationSchema.safeParse(req.body);
  if (!parsed.success) return invalidBody(res, parsed.error);
  const userId = userIdOrUnauthorized(req, res);
  if (!userId) return res;
  try {
    const conversation = await ConversationModel.create({ userId, title: parsed.data.title ?? "New Battle", pinned: false, messages: [] });
    return res.status(201).json({ success: true, conversation });
  } catch (error) {
    console.error("CREATE CONVERSATION ERROR:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export async function getConversations(req: Request, res: Response): Promise<Response> {
  const userId = userIdOrUnauthorized(req, res);
  if (!userId) return res;
  try {
    const conversations = await ConversationModel.find({ userId }).sort({ updatedAt: -1 }).select("_id title pinned createdAt updatedAt");
    return res.status(200).json({ success: true, conversations });
  } catch (error) {
    console.error("GET CONVERSATIONS ERROR:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export async function getConversation(req: Request, res: Response): Promise<Response> {
  if (!validId(req, res)) return res;
  const userId = userIdOrUnauthorized(req, res);
  if (!userId) return res;
  try {
    const conversation = await ConversationModel.findOne({ _id: conversationId(req), userId });
    if (!conversation) return res.status(404).json({ success: false, message: "Conversation not found" });
    return res.status(200).json({ success: true, conversation });
  } catch (error) {
    console.error("GET CONVERSATION ERROR:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export async function addMessage(req: Request, res: Response): Promise<Response> {
  if (!validId(req, res)) return res;
  const parsed = addMessageSchema.safeParse(req.body);
  if (!parsed.success) return invalidBody(res, parsed.error);
  const userId = userIdOrUnauthorized(req, res);
  if (!userId) return res;
  try {
    const conversation = await ConversationModel.findOne({ _id: conversationId(req), userId });
    if (!conversation) return res.status(404).json({ success: false, message: "Conversation not found" });
    const createdAt = new Date();
    conversation.messages.push(
      { role: "user", content: parsed.data.userMessage, createdAt },
      { role: "assistant", ...parsed.data.assistant, createdAt }
    );
    await conversation.save();
    return res.status(200).json({ success: true, conversation });
  } catch (error) {
    console.error("ADD CONVERSATION MESSAGE ERROR:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export async function updateConversation(req: Request, res: Response): Promise<Response> {
  if (!validId(req, res)) return res;
  const parsed = updateConversationSchema.safeParse(req.body);
  if (!parsed.success) return invalidBody(res, parsed.error);
  const userId = userIdOrUnauthorized(req, res);
  if (!userId) return res;
  try {
    const conversation = await ConversationModel.findOneAndUpdate(
      { _id: conversationId(req), userId }, { $set: parsed.data }, { new: true, runValidators: true }
    );
    if (!conversation) return res.status(404).json({ success: false, message: "Conversation not found" });
    return res.status(200).json({ success: true, conversation });
  } catch (error) {
    console.error("UPDATE CONVERSATION ERROR:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export async function deleteConversation(req: Request, res: Response): Promise<Response> {
  if (!validId(req, res)) return res;
  const userId = userIdOrUnauthorized(req, res);
  if (!userId) return res;
  try {
    const conversation = await ConversationModel.findOneAndDelete({ _id: conversationId(req), userId });
    if (!conversation) return res.status(404).json({ success: false, message: "Conversation not found" });
    return res.status(200).json({ success: true, message: "Conversation deleted successfully" });
  } catch (error) {
    console.error("DELETE CONVERSATION ERROR:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}
