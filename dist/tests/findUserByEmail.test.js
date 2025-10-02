"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const mockPrisma_1 = require("./mockPrisma");
const findUserByEmail_1 = require("../helper/findUserByEmail");
describe("find user by email", () => {
    it("should get user by email", () => __awaiter(void 0, void 0, void 0, function* () {
        const testUser = {
            id: "123456abc",
            email: "email@gmail.com",
            name: "name",
            password: "password@123",
            imageUrl: "image",
            isVerified: false,
            role: client_1.UserRoles.CUSTOMER,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        mockPrisma_1.mockedPrisma.users.findUnique.mockResolvedValue(testUser);
        const result = yield (0, findUserByEmail_1.FindUserByEmail)("email@gmail.com");
        expect(mockPrisma_1.mockedPrisma.users.findUnique).toHaveBeenCalledWith({
            where: { email: "email@gmail.com" },
        });
        expect(result).toEqual(testUser);
    }));
});
//# sourceMappingURL=findUserByEmail.test.js.map