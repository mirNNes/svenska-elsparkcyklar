module.exports = {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.js"],

  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/**/swagger.js",
    "!src/**/seedData.js",
    "!src/**/createDefaultAdmin.js"
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"]
};
