import { Router } from "express";
import * as conversationController from "../controllers/conversation.controller.js";
import { authUser } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authUser);
router.post("/", conversationController.createConversation);
router.get("/", conversationController.getConversations);
router.get("/:id", conversationController.getConversation);
router.patch("/:id", conversationController.updateConversation);
router.delete("/:id", conversationController.deleteConversation);
router.post("/:id/messages", conversationController.addMessage);

export default router;
