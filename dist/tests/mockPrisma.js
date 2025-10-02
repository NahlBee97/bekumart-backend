"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockedPrisma = void 0;
const jest_mock_extended_1 = require("jest-mock-extended");
const prisma_1 = require("../lib/prisma");
jest.mock("../lib/prisma", () => ({
    __esModule: true,
    prisma: (0, jest_mock_extended_1.mockDeep)(),
}));
beforeEach(() => {
    (0, jest_mock_extended_1.mockReset)(exports.mockedPrisma);
});
exports.mockedPrisma = prisma_1.prisma;
//# sourceMappingURL=mockPrisma.js.map