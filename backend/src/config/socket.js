const { Server } = require("socket.io");

let io = null;

function initSocket(httpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:5173",
            methods: ["GET", "POST"]
        },
        pingTimeout: 60000,
        pingInterval: 25000
    });

    io.on("connection", (socket) => {
        console.log(`[Socket] Client connected: ${socket.id}`);

        socket.on("join:tracking", (shipmentId) => {
            const room = `shipment:${shipmentId}`;
            socket.join(room);
            console.log(`[Socket] ${socket.id} joined ${room}`);
        });

        socket.on("leave:tracking", (shipmentId) => {
            const room = `shipment:${shipmentId}`;
            socket.leave(room);
            console.log(`[Socket] ${socket.id} left ${room}`);
        });

        socket.on("disconnect", (reason) => {
            console.log(`[Socket] Client disconnected: ${socket.id}, reason: ${reason}`);
        });
    });

    return io;
}

function getIO() {
    if (!io) {
        throw new Error("Socket.IO not initialized");
    }
    return io;
}

module.exports = { initSocket, getIO };
