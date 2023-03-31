import express from "express";
import bodyParser from "body-parser";
import { Server } from "socket.io";
import http from "http";
import dotenv from "dotenv";
import { createClient } from "redis";
import cors from "cors";
import { ExpressPeerServer } from "peer";

dotenv.config();

const PORT = process.env.PORT || 5000;
export const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

const client = createClient({
  url: process.env.REDIS_URL,
});

client.on("error", (err) => console.log("Redis Client Error", err));
client.connect().then(() => console.log("Redis Client Connected"));

// create socket server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
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
  });
});

// broadcast players position every 60fps
setInterval(() => {
  client.hGetAll("players").then((players) => {
    io.sockets.emit("player_moved", players);
  });
}, 1000 / 60);

// peer server
const peerServer = ExpressPeerServer(server, {
  debug: true,
  path: "/",
});
app.use("/peerjs", peerServer);

server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));
