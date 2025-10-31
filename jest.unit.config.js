module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFilesAfterEnv: ["./src/tests/mockPrisma.ts"],
  testMatch: ["**/**/*.unit.test.ts"],
};
