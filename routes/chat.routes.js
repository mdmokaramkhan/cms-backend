import express from "express";
import {
  sendChat,
  getChats,
  getChatByThread,
  getChatByUser,
  createGroupThread,
  sendMessageToThread
} from "../controllers/chat.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/sendChat", authMiddleware, sendChat);
router.get("/getChats", authMiddleware, getChats);
router.get("/getChatByThread", authMiddleware, getChatByThread);
router.get("/getChatByUser", authMiddleware, getChatByUser);

router.post("/threads/group", authMiddleware, createGroupThread);
router.post("/threads/:threadId/messages", authMiddleware, sendMessageToThread);

export default router;
