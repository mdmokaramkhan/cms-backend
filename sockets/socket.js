import { sendChatService } from "../services/chat.service.js";

export const registerSocketHandlers = (io) => {
  const onlineUsers = new Map();

  io.on("connection", (socket) => {
    console.log("User Connected:", socket.id);

    socket.on("user-online", (userId) => {
      onlineUsers.set(userId, socket.id);

      console.log("Online Users:", onlineUsers);
    });

    socket.on("send-message", async (data) => {
      try {
        let { senderId, receiverId, message } = data;

        if (!senderId || !receiverId || !message) {
          return;
        }

        let chat = await sendChatService({
          senderId,
          receiverId,
          message,
        });

        let receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("received-message", chat);
        }

        socket.emit("sent-message", chat);
      } catch (error) {
        console.log("Socket-error:", error.message);
      }
    });

    socket.on("disconnect", async () => {
      for (let [userId, sockId] in onlineUsers.getEntries()) {
        if (sockId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }
    });
  });
};
