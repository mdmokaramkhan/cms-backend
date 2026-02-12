import { sendChatService, getChatsService, getChatByThreadService, getChatByUserService } from "../services/chat.service.js";

export const sendChat = async (req, res) => {
  const { senderId, receiverId, message } = req.body;
  const chat = await sendChatService(senderId, receiverId, message);
  res.status(200).json({
    success: true,
    data: chat
  });
}

export const getChats = async (req, res) => {
    const { threadId } = req.query;
    const chats = await getChatsService(threadId);
    res.status(200).json({
        success: true,
        data: chats
    });
}

export const getChatByThread = async (req, res) => {
    const { threadId } = req.query;
    const chats = await getChatByThreadService(threadId);
    res.status(200).json({
        success: true,
        data: chats
    });
}

export const getChatByUser = async (req, res) => {
    const { userId } = req.query;
    const chats = await getChatByUserService(userId);
    res.status(200).json({
        success: true,
        data: chats
    });
}
