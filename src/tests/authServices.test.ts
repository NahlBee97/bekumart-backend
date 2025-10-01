import { UserRoles } from "@prisma/client";
import { IRegister } from "../interfaces/authInterfaces";
import bcrypt from "bcryptjs";
import { RegisterService } from "../services/authServices";
import { FindUserByEmail } from "../helper/findUserByEmail";
import { mockedPrisma } from "./mockPrisma";

jest.mock("../helper/findUserByEmail", () => ({
  FindUserByEmail: jest.fn(),
}));

jest.mock("bcryptjs", () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
}));

const mockedFindUserByEmail = FindUserByEmail as jest.Mock;
const mockedSalt = bcrypt.genSalt as jest.Mock;
const mockedHashPassword = bcrypt.hash as jest.Mock;

// ... (imports and initial mock setups are the same)

describe("register service", () => {
  // 1. Centralize common test data
  const registrationData: IRegister = {
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
    role: UserRoles.CUSTOMER,
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

  it("should hash the password and create a new user", async () => {
    // ARRANGE: Only set mocks specific to this test's success path
    mockedPrisma.users.create.mockResolvedValue(createdUser);
    mockedPrisma.carts.create.mockResolvedValue(createdUserCart);
    mockedPrisma.$transaction.mockImplementation(async (callback: any) => await callback(mockedPrisma));

    // ACT
    const result = await RegisterService(registrationData);

    // ASSERT
    expect(mockedHashPassword).toHaveBeenCalledWith(registrationData.password, 10);
    expect(mockedPrisma.users.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ password: hashedPassword }),
    });
    expect(mockedPrisma.carts.create).toHaveBeenCalledWith({
      data: { userId: createdUser.id },
    });
    expect(result).toEqual(createdUser);
  });

  it("should throw an error when an existing user is found", async () => {
    // ARRANGE: Override the default mock from beforeEach for this specific case
    mockedFindUserByEmail.mockResolvedValue(createdUser);

    // ACT & ASSERT
    await expect(RegisterService(registrationData)).rejects.toThrow("Email already registered");
    expect(mockedFindUserByEmail).toHaveBeenCalledWith(registrationData.email);
  });

  it("should throw an error if password hashing fails", async () => {
    // ARRANGE: Override the default mock to simulate a rejection
    const hashingError = new Error("Hashing failed");
    mockedHashPassword.mockRejectedValue(hashingError);

    // ACT & ASSERT
    await expect(RegisterService(registrationData)).rejects.toThrow(hashingError);
    expect(mockedPrisma.$transaction).not.toHaveBeenCalled();
  });

  it("should throw an error if user creation fails within the transaction", async () => {
    // ARRANGE
    const dbError = new Error("Create user failed");
    mockedPrisma.users.create.mockRejectedValue(dbError);
    mockedPrisma.$transaction.mockImplementation(async (callback: any) => await callback(mockedPrisma));

    // ACT & ASSERT
    await expect(RegisterService(registrationData)).rejects.toThrow(dbError);
    expect(mockedPrisma.carts.create).not.toHaveBeenCalled();
  });

  it("should throw an error if cart creation fails within the transaction", async () => {
    // ARRANGE
    const cartError = new Error("Failed to create cart");
    mockedPrisma.users.create.mockResolvedValue(createdUser); // User creation must succeed first
    mockedPrisma.carts.create.mockRejectedValue(cartError);
    mockedPrisma.$transaction.mockImplementation(async (callback: any) => await callback(mockedPrisma));

    // ACT & ASSERT
    await expect(RegisterService(registrationData)).rejects.toThrow(cartError);
  });
});
