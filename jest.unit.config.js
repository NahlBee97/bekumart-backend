module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFilesAfterEnv: ["./src/tests/mocks/prisma.ts"],
  testMatch: ["**/**/*.unit.test.ts"],
};
