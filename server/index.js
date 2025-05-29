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

io.on("connection", (socket) => {
  console.log(`User with id ${socket.id} has connected`);
});

server.listen(PORT, () => {
  console.log(`Server is listening on PORT: ${PORT}`);
});
