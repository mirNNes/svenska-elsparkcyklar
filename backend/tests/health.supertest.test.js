const request = require("supertest");
const app = require("../src/app");

describe("Health (supertest, in-process)", () => {
  it("GET /health -> 200 {status:'ok'}", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});
