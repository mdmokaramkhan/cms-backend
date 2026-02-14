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
  const sortedIds = [String(senderId), String(receiverId)].sort();
  const existingThread = await Thread.findOne({
    participants: { $all: sortedIds },
    $expr: {
      $eq: [{$size: "$participants"}, 2]
    },
  });
  if (!existingThread) {
    const thread = await Thread.create({
      type: "direct",
      participants: sortedIds
    });
    return thread;
  }
  return existingThread;
}

export const sendChatService = async (senderId, receiverId, message) => {
  const thread = await findOrCreateThreadService(senderId, receiverId);
  const chat = await Chat.create({
    thread: thread._id,
    sender: senderId,
    message
  });
  await Thread.findByIdAndUpdate(thread._id, { lastMessage: message });
  const populated = await Chat.findById(chat._id)
    .populate("sender", "name email")
    .lean();
  return populated;
};

/**
 * Create a group thread. creatorId is included in participants.
 */
export const createGroupThreadService = async (creatorId, participantIds, name = "") => {
  const allIds = [creatorId, ...(participantIds || [])].filter(
    (id, i, arr) => arr.indexOf(id) === i
  );
  if (allIds.length < 2) {
    throw new Error("Group must have at least 2 participants");
  }
  const thread = await Thread.create({
    type: "group",
    name: name || "",
    createdBy: creatorId,
    participants: allIds
  });
  return thread;
};

/**
 * Send message to a thread by id. Works for both direct and group. Sender must be a participant.
 */
export const sendMessageToThreadService = async (threadId, senderId, message) => {
  const thread = await Thread.findById(threadId);
  if (!thread) {
    throw new Error("Thread not found");
  }
  const isParticipant = thread.participants.some(
    (p) => String(p) === String(senderId)
  );
  if (!isParticipant) {
    throw new Error("You are not a participant of this thread");
  }
  const chat = await Chat.create({
    thread: threadId,
    sender: senderId,
    message
  });
  await Thread.findByIdAndUpdate(threadId, { lastMessage: message });
  const populated = await Chat.findById(chat._id)
    .populate("sender", "name email")
    .lean();
  return populated;
};

/**
 * Get threads for a user (threads where user is participant), with last message info.
 */
export const getChatByUserService = async (userId) => {
  const threads = await Thread.find({ participants: userId })
    .populate("participants", "name email")
    .sort({ updatedAt: -1 })
    .lean();
  return threads;
};

/**
 * Get thread by id (for socket validation).
 */
export const getThreadByIdService = async (threadId) => {
  const thread = await Thread.findById(threadId).lean();
  return thread;
};
