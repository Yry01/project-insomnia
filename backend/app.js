import express from "express";
import bodyParser from "body-parser";
import { Server } from "socket.io";
import http from "http";
import dotenv from "dotenv";
import { createClient } from "redis";

dotenv.config();

const PORT = process.env.PORT || 5000;
export const app = express();
app.use(bodyParser.json());

// connect to redis
const client = createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

client.on("error", (err) => console.log("Redis Client Error", err));
client.connect();

// create socket server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
  },
});

// socket connection
io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));
