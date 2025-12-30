// ESLint v9 Flat Config for Node backend + Jest tests
module.exports = [
  {
    ignores: ["node_modules/**", "coverage/**", "dist/**", "build/**"],
  },

  // Backend-kod (Node/Express)
  {
    files: ["src/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        // Node globals
        process: "readonly",
        console: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        module: "readonly",
        require: "readonly",
        exports: "readonly",

        // Timers
        setTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        // Web API globals som finns i Node 18+ (t.ex. i auth.js)
        URL: "readonly",
        URLSearchParams: "readonly",
        fetch: "readonly",
        Headers: "readonly",
        Request: "readonly",
        Response: "readonly",
      },
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error",
    },
  },

  // Tester (Jest)
  {
    files: ["tests/**/*.test.js", "tests/**/*.spec.js", "tests/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        // Node
        process: "readonly",
        console: "readonly",
        module: "readonly",
        require: "readonly",

        setTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",

        // Jest globals
        describe: "readonly",
        test: "readonly",
        it: "readonly",
        expect: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        jest: "readonly",
      },
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error",
    },
  },
];
