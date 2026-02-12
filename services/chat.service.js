import Chat from "../models/chat.js";
import Thread from "../models/thread.js";

export const createChatService = async (threadId, senderId, message) => {
  const chat = await Chat.create({
    thread: threadId,
    sender: senderId,
    message,
  });
  return chat;
};

export const getChatsService = async (threadId) => {
  const chats = await Chat.find({ thread: threadId });
  return chats;
};

export const getChatByThreadService = async (threadId) => {
  return await Chat.find({ thread: threadId })
    .populate("sender", "name email")
    .sort({ createdAt: 1 });
};

export const findOrCreateThreadService = async (senderId, receiverId) => {
  const sortedIds = [senderId, receiverId].sort();
  const existingThread = await Thread.findOne({
    participants: { $all: sortedIds },
    $expr: {
      $eq: [{$size: "$participants"}, 2]
    },
  });
  if (!existingThread) {
    const thread = await Thread.create({ participants: sortedIds });
    return thread;
  } else {
    return existingThread;
  }
}

export const sendChatService = async (senderId, receiverId, message) => {
  const thread = await findOrCreateThreadService(senderId, receiverId);
  return await createChatService(thread._id, senderId, message);
};
