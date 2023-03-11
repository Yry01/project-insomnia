import express from "express";
import bodyParser from "body-parser";
import { Server } from "socket.io";
import http from "http";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5000;
export const app = express();
app.use(bodyParser.json());

app.listen(PORT, () => console.log(`Server has started on port ${PORT}`));
