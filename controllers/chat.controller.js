import {
  sendChatService,
  getChatsService,
  getChatByThreadService,
  getChatByUserService,
  createGroupThreadService,
  sendMessageToThreadService
} from "../services/chat.service.js";

export const sendChat = async (req, res) => {
  try {
    const senderId = req.user?.id;
    if (!senderId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    const { receiverId, message } = req.body;
    if (!receiverId || !message?.trim()) {
      return res.status(400).json({ success: false, message: "receiverId and message required" });
    }
    const chat = await sendChatService(senderId, receiverId, message.trim());
    res.status(200).json({ success: true, data: chat });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getChats = async (req, res) => {
  try {
    const { threadId } = req.query;
    if (!threadId) {
      return res.status(400).json({ success: false, message: "threadId required" });
    }
    const chats = await getChatsService(threadId);
    res.status(200).json({ success: true, data: chats });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getChatByThread = async (req, res) => {
  try {
    const { threadId } = req.query;
    if (!threadId) {
      return res.status(400).json({ success: false, message: "threadId required" });
    }
    const chats = await getChatByThreadService(threadId);
    res.status(200).json({ success: true, data: chats });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getChatByUser = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId required (query or auth)"
      });
    }
    const threads = await getChatByUserService(userId);
    res.status(200).json({ success: true, data: threads });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const createGroupThread = async (req, res) => {
  try {
    const creatorId = req.user?.id;
    if (!creatorId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    const { participantIds, name } = req.body;
    const thread = await createGroupThreadService(creatorId, participantIds, name);
    res.status(201).json({ success: true, data: thread });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const sendMessageToThread = async (req, res) => {
  try {
    const senderId = req.user?.id;
    if (!senderId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    const { threadId } = req.params;
    const { message } = req.body;
    if (!threadId || !message?.trim()) {
      return res.status(400).json({ success: false, message: "threadId and message required" });
    }
    const chat = await sendMessageToThreadService(threadId, senderId, message.trim());
    res.status(200).json({ success: true, data: chat });
  } catch (err) {
    const status = err.message === "Thread not found" ? 404 : 400;
    res.status(status).json({ success: false, message: err.message });
  }
};
