import jwt from "jsonwebtoken";
import {
  sendMessageToThreadService,
  getThreadByIdService,
  findOrCreateThreadService
} from "../services/chat.service.js";
import { SOCKET_EVENTS, threadRoom } from "./events.js";

/** @type {Map<string, Set<string>>} userId -> Set of socketIds (multi-device) */
const presenceMap = new Map();

/** @type {Map<string, string>} socketId -> userId */
const socketToUser = new Map();

/** @type {Map<string, Map<string, number>>} threadId -> { userId -> typing timeout } */
const typingTimers = new Map();

/**
 * Get authenticated user from handshake (optional).
 * Supports: handshake.auth.token, handshake.auth.authorization, handshake.query.token
 */
function getAuthUser(socket) {
  const token =
    socket.handshake?.auth?.token ||
    socket.handshake?.auth?.authorization?.replace?.("Bearer ", "") ||
    socket.handshake?.query?.token;
  if (!token || !process.env.JWT_SECRET) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded?.id || decoded?.userId || decoded?.user?.id || null;
  } catch {
    return null;
  }
}

function addPresence(userId, socketId) {
  if (!userId) return;
  if (!presenceMap.has(userId)) presenceMap.set(userId, new Set());
  presenceMap.get(userId).add(socketId);
  socketToUser.set(socketId, userId);
}

function removePresence(socketId) {
  const userId = socketToUser.get(socketId);
  socketToUser.delete(socketId);
  if (!userId) return;
  const set = presenceMap.get(userId);
  if (!set) return;
  set.delete(socketId);
  if (set.size === 0) presenceMap.delete(userId);
}

function clearTypingInThread(threadId, userId) {
  const timers = typingTimers.get(threadId);
  if (!timers) return;
  const t = timers.get(userId);
  if (t) clearTimeout(t);
  timers.delete(userId);
  if (timers.size === 0) typingTimers.delete(threadId);
}

function logEvent(direction, event, socketId, payload = null) {
  const ts = new Date().toISOString();
  const payloadStr = payload !== undefined && payload !== null
    ? (typeof payload === "object" ? JSON.stringify(payload) : String(payload))
    : "";
  console.log(`[${ts}] [socket] ${direction} ${event} (${socketId}) ${payloadStr}`.trim());
}

export const registerSocketHandlers = (io) => {
  io.on("connection", (socket) => {
    const authUserId = getAuthUser(socket);
    logEvent("connect", "connection", socket.id, { authenticated: !!authUserId });

    socket.onAny((event, ...args) => {
      logEvent("← in", event, socket.id, args.length ? args : null);
    });

    const originalEmit = socket.emit.bind(socket);
    socket.emit = function (event, ...args) {
      logEvent("→ out", event, socket.id, args.length ? args : null);
      return originalEmit(event, ...args);
    };

    socket.emit(SOCKET_EVENTS.CONNECTED, {
      socketId: socket.id,
      authenticated: !!authUserId,
      authenticatedUserId: authUserId || null
    });

    // Auth / presence: client can set userId (required if no JWT)
    const handleAuth = (payload, ack) => {
      const userId = (typeof payload === "string" ? payload : payload?.userId) || authUserId;
      if (!userId) {
        const err = { message: "userId required" };
        ack?.(err);
        socket.emit(SOCKET_EVENTS.ERROR, err);
        return;
      }
      addPresence(userId, socket.id);
      socket.userId = userId;
      ack?.({ success: true, userId });
    };
    socket.on(SOCKET_EVENTS.AUTH, handleAuth);
    socket.on("user-online", handleAuth);

    socket.on(SOCKET_EVENTS.JOIN_THREAD, async (data, ack) => {
      try {
        const userId = socket.userId || authUserId || data?.userId;
        const threadId = data?.threadId;

        if (!threadId) {
          const err = { message: "threadId required" };
          ack?.(err);
          socket.emit(SOCKET_EVENTS.ERROR, err);
          return;
        }
        if (!userId) {
          const err = { message: "userId required" };
          ack?.(err);
          socket.emit(SOCKET_EVENTS.ERROR, err);
          return;
        }

        const thread = await getThreadByIdService(threadId);
        if (!thread) {
          const err = { message: "Thread not found" };
          ack?.(err);
          socket.emit(SOCKET_EVENTS.ERROR, err);
          return;
        }

        const isParticipant = thread.participants.some(
          (p) => String(p) === String(userId)
        );
        if (!isParticipant) {
          const err = { message: "Not a participant of this thread" };
          ack?.(err);
          socket.emit(SOCKET_EVENTS.ERROR, err);
          return;
        }

        const room = threadRoom(threadId);
        socket.join(room);

        ack?.({ success: true, threadId });
      } catch (err) {
        const e = { message: err?.message || "Failed to join thread" };
        ack?.(e);
        socket.emit(SOCKET_EVENTS.ERROR, e);
      }
    });

    socket.on(SOCKET_EVENTS.LEAVE_THREAD, (data) => {
      const threadId = data?.threadId;
      if (threadId) {
        socket.leave(threadRoom(threadId));
        const userId = socket.userId || authUserId;
        if (userId) clearTypingInThread(threadId, userId);
      }
    });

    socket.on(SOCKET_EVENTS.SEND_MESSAGE, async (data, ack) => {
      try {
        const userId = socket.userId || authUserId || data?.senderId;
        const { threadId, receiverId, message } = data;

        if (!message?.trim()) {
          const err = { message: "Message is required" };
          ack?.(err);
          socket.emit(SOCKET_EVENTS.ERROR, err);
          return;
        }
        if (!userId) {
          const err = { message: "senderId / userId required" };
          ack?.(err);
          socket.emit(SOCKET_EVENTS.ERROR, err);
          return;
        }

        let chat;

        // Path 1: Send to existing thread (direct or group)
        const emitToRoom = (r, chatData) => {
          socket.to(r).emit(SOCKET_EVENTS.MESSAGE, chatData);
        };
        const emitToSender = (chatData) => {
          socket.emit(SOCKET_EVENTS.MESSAGE_SENT, chatData);
        };
        const emitToSocket = (sid, chatData) => {
          io.to(sid).emit(SOCKET_EVENTS.MESSAGE, chatData);
        };

        if (threadId) {
          chat = await sendMessageToThreadService(threadId, userId, message.trim());
          const room = threadRoom(threadId);
          emitToRoom(room, chat);
          emitToSender(chat);
        } else if (receiverId) {
          // Path 2: 1:1 — find or create thread, then send
          const thread = await findOrCreateThreadService(userId, receiverId);
          chat = await sendMessageToThreadService(thread._id, userId, message.trim());
          // Emit only to receiver's sockets (room emit would duplicate when receiver joined thread)
          const receiverSockets = presenceMap.get(String(receiverId));
          if (receiverSockets) {
            for (const sid of receiverSockets) {
              if (sid !== socket.id) emitToSocket(sid, chat);
            }
          }
          emitToSender(chat);
        } else {
          const err = { message: "threadId or receiverId required" };
          ack?.(err);
          socket.emit(SOCKET_EVENTS.ERROR, err);
          return;
        }

        ack?.({ success: true, chat });
      } catch (err) {
        const e = { message: err?.message || "Failed to send message" };
        ack?.(e);
        socket.emit(SOCKET_EVENTS.ERROR, e);
      }
    });

    socket.on(SOCKET_EVENTS.TYPING_START, async (data) => {
      const userId = socket.userId || authUserId || data?.userId;
      const threadId = data?.threadId;
      if (!userId || !threadId) return;

      const thread = await getThreadByIdService(threadId);
      if (!thread) return;
      const isParticipant = thread.participants.some(
        (p) => String(p) === String(userId)
      );
      if (!isParticipant) return;

      const room = threadRoom(threadId);

      // Clear existing typing timer
      if (!typingTimers.has(threadId)) typingTimers.set(threadId, new Map());
      const timers = typingTimers.get(threadId);
      const existing = timers.get(userId);
      if (existing) clearTimeout(existing);

      const timer = setTimeout(() => {
        clearTypingInThread(threadId, userId);
        socket.to(room).emit(SOCKET_EVENTS.USER_STOPPED_TYPING, {
          threadId,
          userId
        });
      }, 3000);
      timers.set(userId, timer);

      socket.to(room).emit(SOCKET_EVENTS.USER_TYPING, {
        threadId,
        userId
      });
    });

    socket.on(SOCKET_EVENTS.TYPING_STOP, (data) => {
      const userId = socket.userId || authUserId || data?.userId;
      const threadId = data?.threadId;
      if (!userId || !threadId) return;

      const room = threadRoom(threadId);
      clearTypingInThread(threadId, userId);
      socket.to(room).emit(SOCKET_EVENTS.USER_STOPPED_TYPING, {
        threadId,
        userId
      });
    });

    socket.on("disconnect", (reason) => {
      logEvent("disconnect", "disconnect", socket.id, { reason });
      const userId = socket.userId || authUserId;
      removePresence(socket.id);

      // Leave all thread rooms (Socket.IO does this automatically, but we clear typing)
      if (typingTimers.size > 0 && userId) {
        for (const [threadId, timers] of typingTimers.entries()) {
          if (timers.has(userId)) {
            clearTypingInThread(threadId, userId);
          }
        }
      }
    });
  });
};
