import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const PORT = 4500;
const onlineUsers = {};

io.on("connection", (socket) => {
  console.log(`User with id ${socket.id} has connected`);
  socket.on("join-room", ({ roomId, sender }) => {
    onlineUsers[sender] = socket.id;
    io.emit("onlineStatus", onlineUsers);
    socket.join(roomId);
    console.log(`${sender} has joined room ${roomId}`);
  });
  socket.on("privateMessage", ({ roomId, sender, message, time }) => {
    console.log(`User ${sender} has sent a message`);
    io.to(roomId).emit("privateMessage", { sender, message, time });
  });

  socket.on("disconnect", () => {
    for (let user in onlineUsers) {
      if (onlineUsers[user] == socket.id) {
        delete onlineUsers[user];
        io.emit("onlineStatus", onlineUsers);
        break;
      }
    }
    console.log(`User with has disconnected`);
  });
});

server.listen(PORT, () => {
  console.log(`Server is listening on PORT: ${PORT}`);
});
