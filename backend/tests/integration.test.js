const request = require("supertest");
const { spawn } = require("child_process");
const http = require("http");

function waitForHealthy(url, timeoutMs = 15000) {
  const start = Date.now();

  return new Promise((resolve, reject) => {
    const tick = () => {
      const req = http.get(url, (res) => {
        res.resume();
        if (res.statusCode === 200) return resolve();
        retry();
      });
      req.on("error", retry);

      function retry() {
        if (Date.now() - start > timeoutMs) {
          return reject(new Error(`Timeout waiting for ${url}`));
        }
        setTimeout(tick, 300);
      }
    };

    tick();
  });
}

describe("Backend integration (no backend code changes)", () => {
  let proc;
  let baseUrl;
  const PORT = Number(process.env.PORT || 5105);


  beforeAll(async () => {
    baseUrl = `http://localhost:${PORT}`;

    proc = spawn("node", ["src/server.js"], {
      cwd: process.cwd(), // backend/
      env: {
        ...process.env,
        PORT: String(PORT),
        NODE_ENV: "test",
        // Viktigt: peka mot test-db (CI service eller lokal mongo)
        MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/elsparkcyklar_test",
      },
      stdio: "inherit", // visar backend-logs i test-output (bra i CI)
    });

    await waitForHealthy(`${baseUrl}/health`, 20000);
  }, 30000);

  afterAll(async () => {
    if (proc) {
      proc.kill("SIGTERM");
    }
  });

  test("GET /health -> 200 {status:'ok'}", async () => {
    const res = await request(baseUrl).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status", "ok");
  });

  test("GET /api -> 200", async () => {
    const res = await request(baseUrl).get("/api");
    expect(res.status).toBe(200);
  });

  test("POST /api/auth/login wrong password -> 401", async () => {
    const res = await request(baseUrl)
      .post("/api/auth/login")
      .send({ email: "admin@elspark.com", password: "wrong" });

    expect(res.status).toBe(401);
  });

  test("POST /api/auth/login correct admin -> 200 + tokens", async () => {
    const res = await request(baseUrl)
      .post("/api/auth/login")
      .send({ email: "admin@elspark.com", password: "admin123" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("access_token");
    expect(res.body).toHaveProperty("refresh_token");
    expect(typeof res.body.access_token).toBe("string");
    expect(typeof res.body.refresh_token).toBe("string");
    expect(res.body.user).toHaveProperty("role", "admin");
  });

  test("GET /api/bike -> 200 and array", async () => {
    const res = await request(baseUrl).get("/api/bike");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
