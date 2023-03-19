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
      io.sockets.emit("player_disconnected", socket.id);
    });
  });

  // new player joined
  socket.on("player_joined", (data) => {
    client.hSet("players", socket.id, JSON.stringify(data));
    io.sockets.emit("player_joined", data);
  });

  // existing players
  socket.on("online_players", () => {
    client.hGetAll("players").then((players) => {
      socket.emit("online_players", players);
    });
  });

  // player Moved
  socket.on("player_moved", (player) => {
    client.hSet("players", player.id, JSON.stringify(player));
    client.hGetAll("players").then((players) => {
      io.sockets.emit("player_moved", players);
    });
  });
});

server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));
