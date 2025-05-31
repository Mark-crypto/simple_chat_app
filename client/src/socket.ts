import { Socket, io } from "socket.io-client";

const url = "http://localhost:4500";

export const socket: Socket = io(url);
