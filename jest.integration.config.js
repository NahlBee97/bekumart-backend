module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  globalSetup: "./src/tests/globalSetup.ts",
  testMatch: ["**/**/*.integration.test.ts"],
  testTimeout: 15000,
};
