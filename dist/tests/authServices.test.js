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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authServices_1 = require("../services/authServices");
const findUserByEmail_1 = require("../helper/findUserByEmail");
const mockPrisma_1 = require("./mockPrisma");
const config_1 = require("../config");
jest.mock("../helper/findUserByEmail", () => ({
    FindUserByEmail: jest.fn(),
}));
jest.mock("bcryptjs", () => ({
    genSalt: jest.fn(),
    hash: jest.fn(),
    compare: jest.fn(),
}));
jest.mock("jsonwebtoken", () => ({
    sign: jest.fn(),
}));
const mockedFindUserByEmail = findUserByEmail_1.FindUserByEmail;
const mockedSalt = bcryptjs_1.default.genSalt;
const mockedHashPassword = bcryptjs_1.default.hash;
const mockedCompare = bcryptjs_1.default.compare;
const mockedSign = jsonwebtoken_1.default.sign;
// ... (imports and initial mock setups are the same)
describe("register service", () => {
    // 1. Centralize common test data
    const registrationData = {
        name: "nama",
        email: "nama@gmail.com",
        password: "password@123",
    };
    const hashedPassword = "hashedpassword";
    const createdUser = {
        id: "123456abc",
        name: registrationData.name,
        email: registrationData.email,
        password: hashedPassword,
        imageUrl: "image",
        isVerified: false,
        role: client_1.UserRoles.CUSTOMER,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    const createdUserCart = {
        id: "ajakf",
        userId: createdUser.id,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    beforeEach(() => {
        jest.resetAllMocks();
        // 2. Set up default "happy path" mocks used in most tests
        mockedFindUserByEmail.mockResolvedValue(null);
        mockedSalt.mockResolvedValue(10);
        mockedHashPassword.mockResolvedValue(hashedPassword);
    });
    it("should hash the password and create a new user", () => __awaiter(void 0, void 0, void 0, function* () {
        // ARRANGE: Only set mocks specific to this test's success path
        mockPrisma_1.mockedPrisma.users.create.mockResolvedValue(createdUser);
        mockPrisma_1.mockedPrisma.carts.create.mockResolvedValue(createdUserCart);
        mockPrisma_1.mockedPrisma.$transaction.mockImplementation((callback) => __awaiter(void 0, void 0, void 0, function* () { return yield callback(mockPrisma_1.mockedPrisma); }));
        // ACT
        const result = yield (0, authServices_1.RegisterService)(registrationData);
        // ASSERT
        expect(mockedHashPassword).toHaveBeenCalledWith(registrationData.password, 10);
        expect(mockPrisma_1.mockedPrisma.users.create).toHaveBeenCalledWith({
            data: expect.objectContaining({ password: hashedPassword }),
        });
        expect(mockPrisma_1.mockedPrisma.carts.create).toHaveBeenCalledWith({
            data: { userId: createdUser.id },
        });
        expect(result).toEqual(createdUser);
    }));
    it("should throw an error when an existing user is found", () => __awaiter(void 0, void 0, void 0, function* () {
        // ARRANGE: Override the default mock from beforeEach for this specific case
        mockedFindUserByEmail.mockResolvedValue(createdUser);
        // ACT & ASSERT
        yield expect((0, authServices_1.RegisterService)(registrationData)).rejects.toThrow("Email already registered");
        expect(mockedFindUserByEmail).toHaveBeenCalledWith(registrationData.email);
    }));
    it("should throw an error if password hashing fails", () => __awaiter(void 0, void 0, void 0, function* () {
        // ARRANGE: Override the default mock to simulate a rejection
        const hashingError = new Error("Hashing failed");
        mockedHashPassword.mockRejectedValue(hashingError);
        // ACT & ASSERT
        yield expect((0, authServices_1.RegisterService)(registrationData)).rejects.toThrow(hashingError);
        expect(mockPrisma_1.mockedPrisma.$transaction).not.toHaveBeenCalled();
    }));
    it("should throw an error if user creation fails within the transaction", () => __awaiter(void 0, void 0, void 0, function* () {
        // ARRANGE
        const dbError = new Error("Create user failed");
        mockPrisma_1.mockedPrisma.users.create.mockRejectedValue(dbError);
        mockPrisma_1.mockedPrisma.$transaction.mockImplementation((callback) => __awaiter(void 0, void 0, void 0, function* () { return yield callback(mockPrisma_1.mockedPrisma); }));
        // ACT & ASSERT
        yield expect((0, authServices_1.RegisterService)(registrationData)).rejects.toThrow(dbError);
        expect(mockPrisma_1.mockedPrisma.carts.create).not.toHaveBeenCalled();
    }));
    it("should throw an error if cart creation fails within the transaction", () => __awaiter(void 0, void 0, void 0, function* () {
        // ARRANGE
        const cartError = new Error("Failed to create cart");
        mockPrisma_1.mockedPrisma.users.create.mockResolvedValue(createdUser); // User creation must succeed first
        mockPrisma_1.mockedPrisma.carts.create.mockRejectedValue(cartError);
        mockPrisma_1.mockedPrisma.$transaction.mockImplementation((callback) => __awaiter(void 0, void 0, void 0, function* () { return yield callback(mockPrisma_1.mockedPrisma); }));
        // ACT & ASSERT
        yield expect((0, authServices_1.RegisterService)(registrationData)).rejects.toThrow(cartError);
    }));
});
describe("Login Service", () => {
    const loginData = {
        email: "name@gmail.com",
        password: "Password@123",
    };
    const existingUser = {
        id: "123456abc",
        name: "name",
        email: loginData.email,
        password: "hashedPassword",
        imageUrl: "image",
        isVerified: false,
        role: client_1.UserRoles.CUSTOMER,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    const expectedPayload = {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
        role: existingUser.role,
        isVerified: existingUser.isVerified,
        imageUrl: existingUser.imageUrl,
    };
    const token = "randomstring";
    beforeEach(() => {
        jest.resetAllMocks();
        mockedFindUserByEmail.mockResolvedValue(existingUser);
        mockedCompare.mockResolvedValue(true);
        mockedSign.mockReturnValue(token);
    });
    it("should return a token for valid credentials", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield (0, authServices_1.LoginService)(loginData);
        expect(mockedFindUserByEmail).toHaveBeenCalledWith(loginData.email);
        expect(mockedCompare).toHaveBeenCalledWith(loginData.password, existingUser.password);
        expect(mockedSign).toHaveBeenCalledWith(expectedPayload, String(config_1.JWT_SECRET), {
            expiresIn: "1h",
        });
        expect(result).toEqual(token);
    }));
    it("should throw a 'User not found' error for a non-existent email", () => __awaiter(void 0, void 0, void 0, function* () {
        mockedFindUserByEmail.mockResolvedValue(null);
        yield expect((0, authServices_1.LoginService)(loginData)).rejects.toThrow("User not found");
        expect(mockedFindUserByEmail).toHaveBeenCalledWith(loginData.email);
    }));
    it("should throw an 'Incorrect Password' error for a password mismatch", () => __awaiter(void 0, void 0, void 0, function* () {
        mockedCompare.mockResolvedValue(false);
        yield expect((0, authServices_1.LoginService)(loginData)).rejects.toThrow("Incorrect Password");
        expect(mockedFindUserByEmail).toHaveBeenCalledWith(loginData.email);
    }));
    it("should throw a 'Failed to generate token' error if token signing fails", () => __awaiter(void 0, void 0, void 0, function* () {
        mockedSign.mockReturnValue(null);
        yield expect((0, authServices_1.LoginService)(loginData)).rejects.toThrow("Failed to generate token");
        expect(mockedFindUserByEmail).toHaveBeenCalledWith(loginData.email);
    }));
});
//# sourceMappingURL=authServices.test.js.map