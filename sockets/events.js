/**
 * Central Socket.IO event names and room naming for the chat app.
 * Use these constants for consistency between server and clients.
 */

export const SOCKET_EVENTS = {
  // Client → Server
  AUTH: "auth",
  JOIN_THREAD: "join-thread",
  LEAVE_THREAD: "leave-thread",
  SEND_MESSAGE: "send-message",
  TYPING_START: "typing-start",
  TYPING_STOP: "typing-stop",

  // Server → Client
  MESSAGE: "message",
  MESSAGE_SENT: "message-sent",
  USER_TYPING: "user-typing",
  USER_STOPPED_TYPING: "user-stopped-typing",
  PRESENCE_UPDATE: "presence-update",
  USER_ONLINE: "user-online",
  USER_OFFLINE: "user-offline",
  ERROR: "socket-error",
  CONNECTED: "connected"
};

/**
 * Room name for a thread. Use this for joining/leaving.
 * @param {string} threadId
 * @returns {string}
 */
export const threadRoom = (threadId) => `thread:${threadId}`;
