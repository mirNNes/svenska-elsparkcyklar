// Startfil som kopplar ihop Express och gemensamt middleware.
require("dotenv").config();
const express = require("express");
const apiRouter = require("./routes");
const connectDB = require("./db");
const cors = require("cors");
const createDefaultAdmin = require("./createDefaultAdmin");
const http = require("http");
const { Server } = require("socket.io");
const { verifyAccessToken } = require("./utils/jwt");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Tillåt frontend som körs på Vite (http://localhost:5173)
app.use(
  cors({
    origin: [
      "http://localhost:3003", // admin frontend
      "http://localhost:5173",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use("/api", apiRouter);

// Swagger UI för att överblicka API:t
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
  res.send("Backend fungerar!");
});

// 404 för alla okända routes.
app.use((req, res, next) => {
  res.status(404).json({ error: "Route not found" });
});

// Enkel central felhanterare.
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Internal server error" });
});

// Socket.io server
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3003", "http://localhost:5173"],
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

// Start server
connectDB()
  .then(async () => {
    console.log("MongoDB connected");

    await createDefaultAdmin();

    server.listen(PORT, () => {
      console.log(`Backend + Socket.IO kör på port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect DB:", err);
    process.exit(1);
  });
