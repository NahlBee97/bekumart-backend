// src/tests/singleton.ts
import { PrismaClient } from "@prisma/client";
import { DeepMockProxy, mockDeep, mockReset } from "jest-mock-extended";
import { prisma } from "../lib/prisma";

jest.mock("../lib/prisma", () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>(),
}));

beforeEach(() => {
  mockReset(mockedPrisma);
});

export const mockedPrisma = prisma as unknown as DeepMockProxy<PrismaClient>;
