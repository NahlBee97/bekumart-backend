// jest.config.js
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/**/*.test.ts"],
  setupFilesAfterEnv: ["./src/tests/singleton.ts"], // Important: runs the mock setup
};
