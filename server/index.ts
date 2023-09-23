import express from "express";
import { Server, Socket } from "socket.io";
import { createServer } from "http";
import cors from "cors";
import { instrument } from "@socket.io/admin-ui";
import { ClientToServerEvents, ServerToClientEvents } from "../typings";

const app = express();
app.use(cors());
const server = createServer(app);

const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
	cors: {
		origin: ["http://localhost:5173", "https://admin.socket.io"],
		methods: ["GET", "POST"],
		credentials: true,
	},
});

instrument(io, {
	auth: false,
	mode: "development",
});

io.on(
	"connection",
	(socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
        console.log(`user connected: ${socket.id}`);
		socket.on("clientMsg", (data) => {
			console.log(data);
			if (data.room === "") {
				io.sockets.emit("serverMsg", data);
			} else {
				socket.join(data.room);
				io.to(data.room).emit("serverMsg", data);
			}
		});
	}
);

server.listen(3000, () => {
	console.log(`Server running ${3000}`);
});