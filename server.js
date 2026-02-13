import dotenv from "dotenv";
dotenv.config();
import http from "http";
import { Server } from "socket.io";
import { registerSocketHandlers } from "./sockets/socket.js";

import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;

connectDB();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true
  }
});

registerSocketHandlers(io);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
