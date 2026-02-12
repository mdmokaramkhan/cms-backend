import express from "express";
import { sendChat, getChats, getChatByThread, getChatByUser } from "../controllers/chat.controller.js";

const router = express.Router();

router.post("/sendChat", sendChat);
router.get("/getChats", getChats);
router.get("/getChatByThread", getChatByThread);
router.get("/getChatByUser", getChatByUser);

export default router;
