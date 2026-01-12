require("dotenv").config();

const http = require("http");
const app = require("./app");

const connectDB = require("./db");
const createDefaultAdmin = require("./createDefaultAdmin");
const seedData = require("./seedData");
const { setupSocket } = require("./socket");

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB();
    console.log("MongoDB connected");

    await createDefaultAdmin();
    await seedData();

    const server = http.createServer(app);
    setupSocket(server, app);

    server.listen(PORT, () => {
      console.log(`Backend + Socket.IO kör på port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();
