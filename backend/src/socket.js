const { Server } = require("socket.io");
const { verifyAccessToken } = require("./utils/jwt");

function setupSocket(server, app) {
  const io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:3002",
        "http://localhost:3003",
        "http://localhost:3004",
        "http://localhost:5173",
      ],
      credentials: true,
    },
  });

  // Make io available everywhere (simulator, routes, etc)
  app.set("io", io);

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Unauthorized"));

    try {
      const payload = verifyAccessToken(token);
      socket.user = payload;
      next();
    } catch (err) {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });

  return io;
}

module.exports = { setupSocket };
