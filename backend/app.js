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
client.connect().then(() => console.log("Redis Client Connected"));

// create socket server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
  },
});

// socket connection
io.on("connection", (socket) => {
  // send socket id to client
  socket.emit("connection", socket.id);

  // disconnect
  socket.on("disconnect", () => {
    client.hDel("players", socket.id).then(() => {
      io.sockets.emit("playerQuit", socket.id);
    });
  });

  // new player joined
  socket.on("newPlayer", (data) => {
    client.hSet("players", socket.id, JSON.stringify(data));
    io.sockets.emit("newPlayer", data);
  });

  // existing players
  socket.on("existingPlayers", () => {
    client.hGetAll("players").then((players) => {
      socket.emit("existingPlayers", players);
    });
  });

  // player Moved
  socket.on("playerMoved", (player) => {
    client.hSet("players", player.id, JSON.stringify(player));
    client.hGetAll("players").then((players) => {
      io.sockets.emit("playerMoved", players);
    });
  });
});

server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));
