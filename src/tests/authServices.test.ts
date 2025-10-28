import bcrypt from "bcryptjs";
import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import {
  CheckService,
  GoogleLoginService,
  LoginService,
  LogOutService,
  RefreshTokenService,
  RegisterService,
  SetPasswordService,
} from "../services/authServices";
import { FindUserByEmail } from "../helper/findUserByEmail";
import { mockedPrisma } from "./mockPrisma";
import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } from "../config";
import { AppError } from "../utils/appError";
import { accessPayload, accessToken, createdUser, createdUserCart, existingUser, GoogleLoginData, hashedPassword, loginData, newPassword, refreshPayload, refreshToken, registrationData, resolvedToken, token } from "./authContstans";

jest.mock("../helper/findUserByEmail", () => ({
  FindUserByEmail: jest.fn(),
}));

jest.mock("bcryptjs", () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock("jsonwebtoken", () => {
  const actual = jest.requireActual("jsonwebtoken");
  return {
    sign: jest.fn(),
    verify: jest.fn(),
    TokenExpiredError: actual.TokenExpiredError,
    JsonWebTokenError: actual.JsonWebTokenError,
  };
});

const mockedFindUserByEmail = FindUserByEmail as jest.Mock;
const mockedSalt = bcrypt.genSalt as jest.Mock;
const mockedHashPassword = bcrypt.hash as jest.Mock;
const mockedCompare = bcrypt.compare as jest.Mock;
const mockedSign = jwt.sign as jest.Mock;
const mockedVerify = jwt.verify as jest.Mock;

// ... (imports and initial mock setups are the same)

describe("register service", () => {
  beforeEach(() => {
    jest.resetAllMocks();

    // 2. Set up default "happy path" mocks used in most tests
    mockedFindUserByEmail.mockResolvedValue(null);
    mockedSalt.mockResolvedValue(10);
    mockedHashPassword.mockResolvedValue(hashedPassword);
  });

  it("should hash the password and create a new user", async () => {
    mockedPrisma.users.create.mockResolvedValue(createdUser);
    mockedPrisma.carts.create.mockResolvedValue(createdUserCart);
    mockedPrisma.$transaction.mockImplementation(
      async (callback: any) => await callback(mockedPrisma)
    );

    const result = await RegisterService(registrationData);

    expect(mockedHashPassword).toHaveBeenCalledWith(
      registrationData.password,
      10
    );

    expect(mockedPrisma.$transaction).toHaveBeenCalled();

    expect(mockedPrisma.users.create).toHaveBeenCalledWith({
      data: {
        name: registrationData.name,
        email: registrationData.email,
        password: hashedPassword,
        updatedAt: expect.any(Date),
      },
    });

    expect(mockedPrisma.carts.create).toHaveBeenCalledWith({
      data: { userId: createdUser.id },
    });

    expect(result).toEqual(createdUser);
  });

  it("should throw an error when an existing user is found", async () => {
    mockedFindUserByEmail.mockResolvedValue(createdUser);

    await expect(RegisterService(registrationData)).rejects.toThrow(
      "Email already registered"
    );
    expect(mockedFindUserByEmail).toHaveBeenCalledWith(registrationData.email);
  });

  it("should throw an error if password hashing fails", async () => {
    const hashingError = new AppError("Hashing failed", 500);
    mockedHashPassword.mockRejectedValue(hashingError);

    await expect(RegisterService(registrationData)).rejects.toThrow(
      hashingError
    );
    expect(mockedPrisma.$transaction).not.toHaveBeenCalled();
  });

  it("should throw an error if user creation fails within the transaction", async () => {
    const dbError = new AppError("Create user failed", 500);
    mockedPrisma.users.create.mockRejectedValue(dbError);
    mockedPrisma.$transaction.mockImplementation(
      async (callback: any) => await callback(mockedPrisma)
    );

    await expect(RegisterService(registrationData)).rejects.toThrow(dbError);
    expect(mockedPrisma.carts.create).not.toHaveBeenCalled();
  });

  it("should throw an error if cart creation fails within the transaction", async () => {
    const cartError = new AppError("Failed to create cart", 500);
    mockedPrisma.users.create.mockResolvedValue(createdUser); // User creation must succeed first
    mockedPrisma.carts.create.mockRejectedValue(cartError);
    mockedPrisma.$transaction.mockImplementation(
      async (callback: any) => await callback(mockedPrisma)
    );

    await expect(RegisterService(registrationData)).rejects.toThrow(cartError);
  });
});

describe("Login Service", () => {
  beforeEach(() => {
    jest.resetAllMocks();

    mockedFindUserByEmail.mockResolvedValue(existingUser);
    mockedCompare.mockResolvedValue(true);
    mockedSign.mockReturnValue(accessToken).mockReturnValueOnce(refreshToken);
  });

  it("should return tokens for valid credentials and invalidate existing tokens", async () => {
    mockedPrisma.tokens.updateMany.mockImplementation(() => {
      return {
        [Symbol.toStringTag]: "PrismaPromise",
        count: 1,
      } as any;
    });

    mockedPrisma.tokens.create.mockImplementation(() => {
      return {
        token: Promise.resolve({
          id: "1",
          token: refreshToken,
          userId: existingUser.id,
          isValid: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: existingUser,
        }),
        user: () => Promise.resolve(existingUser),
      } as any;
    });

    mockedPrisma.$transaction.mockImplementation(
      async (callback: any) => await callback(mockedPrisma)
    );

    const result = await LoginService(loginData);

    expect(mockedFindUserByEmail).toHaveBeenCalledWith(loginData.email);
    expect(mockedCompare).toHaveBeenCalledWith(
      loginData.password,
      existingUser.password
    );

    expect(mockedSign).toHaveBeenCalledWith(
      accessPayload,
      String(JWT_ACCESS_SECRET),
      {
        expiresIn: "15m",
      }
    );

    expect(mockedSign).toHaveBeenCalledWith(
      refreshPayload,
      String(JWT_REFRESH_SECRET),
      {
        expiresIn: "7d",
      }
    );

    expect(mockedPrisma.$transaction).toHaveBeenCalled();

    expect(mockedPrisma.tokens.updateMany).toHaveBeenCalledWith({
      where: { userId: existingUser.id },
      data: { isValid: false },
    });

    expect(mockedPrisma.tokens.create).toHaveBeenCalledWith({
      data: {
        userId: existingUser.id,
        token: refreshToken,
        updatedAt: expect.any(Date),
      },
    });

    expect(result).toEqual({ accessToken, refreshToken });
  });

  it("should throw a 'User not found' error for a non-existent email", async () => {
    const userError = new AppError("User not found", 404);
    mockedFindUserByEmail.mockResolvedValue(null);

    await expect(LoginService(loginData)).rejects.toThrow(userError);

    expect(mockedFindUserByEmail).toHaveBeenCalledWith(loginData.email);
  });

  it("should throw an 'Incorrect Password' error for a password mismatch", async () => {
    const passwordError = new AppError("Incorrect Password", 401);
    mockedCompare.mockResolvedValue(false);

    await expect(LoginService(loginData)).rejects.toThrow(passwordError);

    expect(mockedFindUserByEmail).toHaveBeenCalledWith(loginData.email);
  });

  it("should throw a 'Failed to generate token' error if token signing fails", async () => {
    const tokenError = new AppError("Failed to generate token", 500);
    mockedSign.mockReturnValue(null);
    mockedSign.mockReturnValue(null);

    await expect(LoginService(loginData)).rejects.toThrow(tokenError);

    expect(mockedFindUserByEmail).toHaveBeenCalledWith(loginData.email);
  });

  it("should throw a 'failed invalidate existing tokens' error if token invalidation fails", async () => {
    const invalidateError = new AppError(
      "failed invalidate existing tokens",
      500
    );
    mockedPrisma.$transaction.mockImplementation(
      async (callback: any) => await callback(mockedPrisma)
    );

    mockedPrisma.tokens.updateMany.mockImplementation(() => {
      throw invalidateError;
    });

    await expect(LoginService(loginData)).rejects.toThrow(invalidateError);

    expect(mockedPrisma.$transaction).toHaveBeenCalled();
    expect(mockedFindUserByEmail).toHaveBeenCalledWith(loginData.email);
    expect(mockedPrisma.tokens.updateMany).toHaveBeenCalledWith({
      where: { userId: existingUser.id },
      data: { isValid: false },
    });
    expect(mockedPrisma.tokens.create).not.toHaveBeenCalled();
  });

  it("should throw a 'failed to store new token' error if token creation fails", async () => {
    const tokenError = new AppError("failed to store new token", 500);

    mockedPrisma.$transaction.mockImplementation(
      async (callback: any) => await callback(mockedPrisma)
    );

    mockedPrisma.tokens.updateMany.mockImplementation(() => {
      return {
        [Symbol.toStringTag]: "PrismaPromise",
        count: 1,
      } as any;
    });
    mockedPrisma.tokens.create.mockImplementation(() => {
      throw tokenError;
    });

    await expect(LoginService(loginData)).rejects.toThrow(tokenError);

    expect(mockedPrisma.$transaction).toHaveBeenCalled();

    expect(mockedPrisma.tokens.updateMany).toHaveBeenCalledWith({
      where: { userId: existingUser.id },
      data: { isValid: false },
    });
    expect(mockedPrisma.tokens.create).toHaveBeenCalledWith({
      data: {
        userId: existingUser.id,
        token: refreshToken,
        updatedAt: expect.any(Date),
      },
    });

    expect(mockedFindUserByEmail).toHaveBeenCalledWith(loginData.email);
  });
});

describe("Google Login Service", () => {
  beforeEach(() => {
    jest.resetAllMocks();

    mockedFindUserByEmail.mockResolvedValue(existingUser);
    mockedCompare.mockResolvedValue(true);
    mockedSign.mockReturnValue(accessToken).mockReturnValueOnce(refreshToken);
  });

  it("should return tokens for valid credentials and invalidate existing tokens", async () => {
    // ARRANGE
    mockedPrisma.tokens.updateMany.mockImplementation(() => {
      return {
        [Symbol.toStringTag]: "PrismaPromise",
        count: 1,
      } as any;
    });

    mockedPrisma.tokens.create.mockImplementation(() => {
      return {
        token: Promise.resolve({
          id: "1",
          token: refreshToken,
          userId: existingUser.id,
          isValid: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: existingUser,
        }),
        user: () => Promise.resolve(existingUser),
      } as any;
    });

    mockedPrisma.$transaction.mockImplementation(
      async (callback: any) => await callback(mockedPrisma)
    );

    // ACT
    const result = await GoogleLoginService(GoogleLoginData);

    // ASSERT
    // 1. Check user authentication
    expect(mockedFindUserByEmail).toHaveBeenCalledWith(loginData.email);

    // 2. Verify token generation
    expect(mockedSign).toHaveBeenCalledWith(
      accessPayload,
      String(JWT_ACCESS_SECRET),
      {
        expiresIn: "15m",
      }
    );

    expect(mockedSign).toHaveBeenCalledWith(
      refreshPayload,
      String(JWT_REFRESH_SECRET),
      {
        expiresIn: "7d",
      }
    );

    // 3. Verify transaction was used
    expect(mockedPrisma.$transaction).toHaveBeenCalled();

    // 5. Verify token operations' parameters
    expect(mockedPrisma.tokens.updateMany).toHaveBeenCalledWith({
      where: { userId: existingUser.id },
      data: { isValid: false },
    });

    expect(mockedPrisma.tokens.create).toHaveBeenCalledWith({
      data: {
        userId: existingUser.id,
        token: refreshToken,
        updatedAt: expect.any(Date),
      },
    });

    // 6. Verify final result
    expect(result).toEqual({ accessToken, refreshToken });
  });

  it("should create new user and cart if non-existent email, return & invalidate tokens", async () => {
    mockedFindUserByEmail.mockResolvedValue(null);
    mockedPrisma.users.create.mockResolvedValue(createdUser);
    mockedPrisma.carts.create.mockResolvedValue(createdUserCart);

    mockedPrisma.tokens.updateMany.mockImplementation(() => {
      return {
        [Symbol.toStringTag]: "PrismaPromise",
        count: 1,
      } as any;
    });

    mockedPrisma.tokens.create.mockImplementation(() => {
      return {
        token: Promise.resolve({
          id: "1",
          token: refreshToken,
          userId: existingUser.id,
          isValid: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: existingUser,
        }),
        user: () => Promise.resolve(existingUser),
      } as any;
    });

    mockedPrisma.$transaction.mockImplementation(
      async (callback: any) => await callback(mockedPrisma)
    );

    // ACT
    const result = await GoogleLoginService(GoogleLoginData);

    // ASSERT
    // 1. Check user authentication
    expect(mockedFindUserByEmail).toHaveBeenCalledWith(GoogleLoginData.email);

    // 2. Verify token generation
    expect(mockedSign).toHaveBeenCalledWith(
      accessPayload,
      String(JWT_ACCESS_SECRET),
      {
        expiresIn: "15m",
      }
    );

    expect(mockedSign).toHaveBeenCalledWith(
      refreshPayload,
      String(JWT_REFRESH_SECRET),
      {
        expiresIn: "7d",
      }
    );

    // 3. Verify transaction was used
    expect(mockedPrisma.$transaction).toHaveBeenCalledTimes(2);

    expect(mockedPrisma.users.create).toHaveBeenCalledWith({
      data: {
        name: GoogleLoginData.name,
        email: GoogleLoginData.email,
      },
    });

    expect(mockedPrisma.carts.create).toHaveBeenCalledWith({
      data: { userId: createdUser.id },
    });

    // 5. Verify token operations' parameters
    expect(mockedPrisma.tokens.updateMany).toHaveBeenCalledWith({
      where: { userId: existingUser.id },
      data: { isValid: false },
    });

    expect(mockedPrisma.tokens.create).toHaveBeenCalledWith({
      data: {
        userId: existingUser.id,
        token: refreshToken,
        updatedAt: expect.any(Date),
      },
    });

    // 6. Verify final result
    expect(result).toEqual({ accessToken, refreshToken });
  });

  it("should throw an error if user creation fails within the transaction", async () => {
    // ARRANGE
    const dbError = new AppError("Create user failed", 500);
    mockedFindUserByEmail.mockResolvedValue(null);

    mockedPrisma.$transaction.mockImplementation(
      async (callback: any) => await callback(mockedPrisma)
    );

    mockedPrisma.users.create.mockRejectedValue(dbError);

    // ACT & ASSERT
    await expect(GoogleLoginService(GoogleLoginData)).rejects.toThrow(dbError);

    // Verify transaction and mocks were called in correct order
    expect(mockedFindUserByEmail).toHaveBeenCalledWith(GoogleLoginData.email);
    expect(mockedPrisma.$transaction).toHaveBeenCalled();
    expect(mockedPrisma.users.create).toHaveBeenCalledWith({
      data: {
        name: GoogleLoginData.name,
        email: GoogleLoginData.email,
      },
    });
    expect(mockedPrisma.carts.create).not.toHaveBeenCalled();
  });

  it("should throw an error if cart creation fails within the transaction", async () => {
    // ARRANGE
    const cartError = new AppError("Failed to create cart", 500);

    mockedFindUserByEmail.mockResolvedValue(null);

    mockedPrisma.$transaction.mockImplementation(
      async (callback: any) => await callback(mockedPrisma)
    );
    mockedPrisma.users.create.mockResolvedValue(createdUser);
    mockedPrisma.carts.create.mockRejectedValue(cartError);

    await expect(GoogleLoginService(GoogleLoginData)).rejects.toThrow(cartError);

    expect(mockedFindUserByEmail).toHaveBeenCalledWith(GoogleLoginData.email);
    expect(mockedPrisma.$transaction).toHaveBeenCalled();
    expect(mockedPrisma.users.create).toHaveBeenCalledWith({
      data: {
        name: GoogleLoginData.name,
        email: GoogleLoginData.email,
      },
    });
    expect(mockedPrisma.carts.create).toHaveBeenCalledWith({
      data: { userId: createdUser.id },
    });
  });

  it("should throw a 'Failed to generate token' error if token signing fails", async () => {
    const tokenError = new AppError("Failed to generate token", 500);

    mockedSign.mockReturnValue(null);
    mockedSign.mockReturnValue(null);

    await expect(GoogleLoginService(GoogleLoginData)).rejects.toThrow(tokenError);

    expect(mockedFindUserByEmail).toHaveBeenCalledWith(GoogleLoginData.email);
  });

  it("should throw a 'failed invalidate existing tokens' error if token invalidation fails", async () => {
    const invalidateError = new AppError(
      "failed invalidate existing tokens",
      500
    );
    mockedPrisma.$transaction.mockImplementation(
      async (callback: any) => await callback(mockedPrisma)
    );
    mockedPrisma.tokens.updateMany.mockImplementation(() => {
      throw invalidateError;
    });

    await expect(GoogleLoginService(GoogleLoginData)).rejects.toThrow(
      invalidateError
    );

    expect(mockedPrisma.$transaction).toHaveBeenCalled();
    expect(mockedFindUserByEmail).toHaveBeenCalledWith(GoogleLoginData.email);
    expect(mockedPrisma.tokens.updateMany).toHaveBeenCalledWith({
      where: { userId: existingUser.id },
      data: { isValid: false },
    });
    expect(mockedPrisma.tokens.create).not.toHaveBeenCalled();
  });

  it("should throw a 'store token failed' error if token creation fails", async () => {
    const tokenError = new AppError("store token failed", 500);
    mockedPrisma.$transaction.mockImplementation(
      async (callback: any) => await callback(mockedPrisma)
    );
    mockedPrisma.tokens.updateMany.mockImplementation(() => {
      return {
        [Symbol.toStringTag]: "PrismaPromise",
        count: 1,
      } as any;
    });
    mockedPrisma.tokens.create.mockImplementation(() => {
      throw tokenError;
    });

    await expect(GoogleLoginService(GoogleLoginData)).rejects.toThrow(tokenError);

    expect(mockedPrisma.$transaction).toHaveBeenCalled();

    expect(mockedFindUserByEmail).toHaveBeenCalledWith(GoogleLoginData.email);
    expect(mockedPrisma.tokens.updateMany).toHaveBeenCalledWith({
      where: { userId: existingUser.id },
      data: { isValid: false },
    });
    expect(mockedPrisma.tokens.create).toHaveBeenCalledWith({
      data: {
        userId: existingUser.id,
        token: refreshToken,
        updatedAt: expect.any(Date),
      },
    });
  });
});

describe("LogOut Service", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockedPrisma.tokens.findUnique.mockResolvedValue(resolvedToken);
  });

  it("should invalidate refresh token", async () => {
    mockedPrisma.tokens.update.mockResolvedValue({
      ...resolvedToken,
      isValid: false,
    });

    await LogOutService(refreshToken);

    expect(mockedPrisma.tokens.findUnique).toHaveBeenCalledWith({
      where: { token: refreshToken },
    });
    expect(mockedPrisma.tokens.update).toHaveBeenCalledWith({
      where: { token: refreshToken },
      data: { isValid: false },
    });
  });

  it("should throw error if token invalidation fails", async () => {
    const invalidateError = new AppError("Failed to invalidate token", 500);

    mockedPrisma.tokens.update.mockImplementation(() => {
      throw invalidateError;
    });

    await expect(LogOutService(refreshToken)).rejects.toThrow(invalidateError);

    expect(mockedPrisma.tokens.findUnique).toHaveBeenCalledWith({
      where: { token: refreshToken },
    });
    expect(mockedPrisma.tokens.update).toHaveBeenCalledWith({
      where: { token: refreshToken },
      data: { isValid: false },
    });
  });

  it("should do nothing if token is not found", async () => {
    mockedPrisma.tokens.findUnique.mockResolvedValue(null);

    await LogOutService(refreshToken);

    expect(mockedPrisma.tokens.findUnique).toHaveBeenCalledWith({
      where: { token: refreshToken },
    });
    expect(mockedPrisma.tokens.update).not.toHaveBeenCalled();
  });

  it("should do nothing if token is already invalid", async () => {
    mockedPrisma.tokens.findUnique.mockResolvedValue({
      ...resolvedToken,
      isValid: false,
    });

    await LogOutService(refreshToken);

    expect(mockedPrisma.tokens.findUnique).toHaveBeenCalledWith({
      where: { token: refreshToken },
    });
    expect(mockedPrisma.tokens.update).not.toHaveBeenCalled();
  });
});

describe("set password service", () => {
  const decoded = { email: "test@gmail.com" };

  const existingUser = {
    ...createdUser,
    email: decoded.email,
  };

  beforeEach(() => {
    jest.resetAllMocks();

    mockedPrisma.users.update.mockResolvedValue({
      ...existingUser,
      password: hashedPassword,
    });
    mockedVerify.mockReturnValue(decoded);
    mockedFindUserByEmail.mockResolvedValue(existingUser);
    mockedSalt.mockResolvedValue(10);
    mockedHashPassword.mockResolvedValue(hashedPassword);
  });

  it("should set new password", async () => {
    await SetPasswordService(newPassword, token);

    expect(mockedVerify).toHaveBeenCalledWith(token, String(JWT_ACCESS_SECRET));
    expect(mockedFindUserByEmail).toHaveBeenCalledWith(decoded.email);
    expect(mockedSalt).toHaveBeenCalledWith(10);
    expect(mockedHashPassword).toHaveBeenCalledWith(newPassword, 10);
    expect(mockedPrisma.users.update).toHaveBeenCalledWith({
      where: {
        id: existingUser.id,
      },
      data: {
        password: hashedPassword,
      },
    });
  });

  it("should throw error if token is expired", async () => {
    const expiredError = new AppError(
      "Session expired. Please log in again",
      401
    );

    mockedVerify.mockImplementation(() => {
      throw new TokenExpiredError("jwt expired", new Date());
    });

    await expect(SetPasswordService(newPassword, token)).rejects.toThrow(
      expiredError
    );

    expect(mockedVerify).toHaveBeenCalledWith(token, String(JWT_ACCESS_SECRET));
    expect(mockedFindUserByEmail).not.toHaveBeenCalled();
  });

  it("should throw error if token is not valid", async () => {
    const invalidError = new AppError(
      "Invalid session token. Please log in again",
      401
    );

    mockedVerify.mockImplementation(() => {
      throw new JsonWebTokenError("Invalid token");
    });

    await expect(SetPasswordService(newPassword, token)).rejects.toThrow(
      invalidError
    );

    expect(mockedVerify).toHaveBeenCalledWith(token, String(JWT_ACCESS_SECRET));
    expect(mockedFindUserByEmail).not.toHaveBeenCalled();
  });

  it("should throw error if user not found", async () => {
    const notFoundError = new AppError("User not found.", 404);

    mockedFindUserByEmail.mockResolvedValue(null);

    await expect(SetPasswordService(newPassword, token)).rejects.toThrow(
      notFoundError
    );

    expect(mockedVerify).toHaveBeenCalledWith(token, String(JWT_ACCESS_SECRET));
    expect(mockedFindUserByEmail).toHaveBeenCalledWith(decoded.email);
    expect(mockedSalt).not.toHaveBeenCalled();
    expect(mockedHashPassword).not.toHaveBeenCalled();
    expect(mockedPrisma.users.update).not.toHaveBeenCalled();
  });

  it("should throw error if hashed password fails", async () => {
    const hashError = new AppError("Failed hashing password", 500);

    mockedHashPassword.mockRejectedValue(hashError);

    await expect(SetPasswordService(newPassword, token)).rejects.toThrow(
      hashError
    );

    expect(mockedVerify).toHaveBeenCalledWith(token, String(JWT_ACCESS_SECRET));
    expect(mockedFindUserByEmail).toHaveBeenCalledWith(decoded.email);
    expect(mockedSalt).toHaveBeenCalledWith(10);
    expect(mockedHashPassword).toHaveBeenCalledWith(newPassword, 10);
    expect(mockedPrisma.users.update).not.toHaveBeenCalled();
  });
  it("should throw error if update password fails", async () => {
    const updateError = new AppError("Failed update password", 500);

    mockedPrisma.users.update.mockImplementation(() => {
      throw updateError;
    });

    await expect(SetPasswordService(newPassword, token)).rejects.toThrow(
      updateError
    );

    expect(mockedVerify).toHaveBeenCalledWith(token, String(JWT_ACCESS_SECRET));
    expect(mockedFindUserByEmail).toHaveBeenCalledWith(decoded.email);
    expect(mockedSalt).toHaveBeenCalledWith(10);
    expect(mockedHashPassword).toHaveBeenCalledWith(newPassword, 10);
    expect(mockedPrisma.users.update).toHaveBeenCalledWith({
      where: {
        id: existingUser.id,
      },
      data: {
        password: hashedPassword,
      },
    });
  });
});

describe("refresh token service", () => {
  const decoded = {
    id: "string",
  };

  const existingUser = {
    ...createdUser,
    id: decoded.id
  };

  beforeEach(() => {
    jest.resetAllMocks();

    mockedPrisma.tokens.findUnique.mockResolvedValue(resolvedToken);
    mockedVerify.mockReturnValue(decoded);
    mockedPrisma.users.findFirst.mockResolvedValue(existingUser);
    mockedSign.mockResolvedValue(accessToken);
  });

  it("should return new access token", async () => {
    const result = await RefreshTokenService(refreshToken);

    expect(mockedPrisma.tokens.findUnique).toHaveBeenCalledWith({
      where: { token: refreshToken },
    });
    expect(mockedVerify).toHaveBeenCalledWith(
      refreshToken,
      String(JWT_REFRESH_SECRET)
    );
    expect(mockedPrisma.users.findFirst).toHaveBeenCalledWith({
      where: { id: decoded.id },
    });
    expect(mockedSign).toHaveBeenCalledWith(
      accessPayload,
      String(JWT_ACCESS_SECRET),
      {
        expiresIn: "15m",
      }
    );

    expect(result).toEqual(refreshToken);
  });

  it("should throw error if refresh token not found", async () => {
    const error = new AppError("Session not found. Please log in again", 401);
    mockedPrisma.tokens.findUnique.mockResolvedValue(null);

    await expect(RefreshTokenService(refreshToken)).rejects.toThrow(error);

    expect(mockedPrisma.tokens.findUnique).toHaveBeenCalledWith({
      where: { token: refreshToken },
    });
    expect(mockedVerify).not.toHaveBeenCalled();
    expect(mockedPrisma.users.findFirst).not.toHaveBeenCalled();
    expect(mockedSign).not.toHaveBeenCalled();
  });

  it("should throw error if refresh token in the database marked as invalid", async () => {
    const error = new AppError("Session is invalid. Please log in again", 401);

    mockedPrisma.tokens.findUnique.mockResolvedValue({
      ...resolvedToken,
      isValid: false,
    });

    await expect(RefreshTokenService(refreshToken)).rejects.toThrow(error);

    expect(mockedPrisma.tokens.findUnique).toHaveBeenCalledWith({
      where: { token: refreshToken },
    });
    expect(mockedVerify).not.toHaveBeenCalled();
    expect(mockedPrisma.users.findFirst).not.toHaveBeenCalled();
    expect(mockedSign).not.toHaveBeenCalled();
  });

  it("should throw error if the verify token throw expired", async () => {
    const error = new TokenExpiredError("Token Expired", new Date());

    mockedVerify.mockImplementation(() => {
      throw error;
    });

    await expect(RefreshTokenService(refreshToken)).rejects.toThrow(
      new AppError("Session expired. Please log in again", 401)
    );

    expect(mockedPrisma.tokens.findUnique).toHaveBeenCalledWith({
      where: { token: refreshToken },
    });
    expect(mockedVerify).toHaveBeenCalledWith(
      refreshToken,
      String(JWT_REFRESH_SECRET)
    );
    expect(mockedPrisma.users.findFirst).not.toHaveBeenCalled();
    expect(mockedSign).not.toHaveBeenCalled();
  });

  it("should throw error if the verify token throw invalid", async () => {
    const error = new JsonWebTokenError("Invalid Token");

    mockedVerify.mockImplementation(() => {
      throw error;
    });

    await expect(RefreshTokenService(refreshToken)).rejects.toThrow(
      new AppError("Invalid session token. Please log in again", 401)
    );

    expect(mockedPrisma.tokens.findUnique).toHaveBeenCalledWith({
      where: { token: refreshToken },
    });
    expect(mockedVerify).toHaveBeenCalledWith(
      refreshToken,
      String(JWT_REFRESH_SECRET)
    );
    expect(mockedPrisma.users.findFirst).not.toHaveBeenCalled();
    expect(mockedSign).not.toHaveBeenCalled();
  });

  it("should throw error if the user not found", async () => {
    const error = new AppError("user not found", 404);

    mockedPrisma.users.findFirst.mockResolvedValue(null);

    await expect(RefreshTokenService(refreshToken)).rejects.toThrow(error);

    expect(mockedPrisma.tokens.findUnique).toHaveBeenCalledWith({
      where: { token: refreshToken },
    });
    expect(mockedVerify).toHaveBeenCalledWith(
      refreshToken,
      String(JWT_REFRESH_SECRET)
    );
    expect(mockedPrisma.users.findFirst).toHaveBeenCalledWith({
      where: { id: decoded.id },
    });
    expect(mockedSign).not.toHaveBeenCalled();
  });

  it("should throw error if new token sign fails", async () => {
    const error = new AppError("Failed to generate token", 500);

    mockedSign.mockReturnValue(null);

    await expect(RefreshTokenService(refreshToken)).rejects.toThrow(error);

    expect(mockedPrisma.tokens.findUnique).toHaveBeenCalledWith({
      where: { token: refreshToken },
    });
    expect(mockedVerify).toHaveBeenCalledWith(
      refreshToken,
      String(JWT_REFRESH_SECRET)
    );
    expect(mockedPrisma.users.findFirst).toHaveBeenCalledWith({
      where: { id: decoded.id },
    });
    expect(mockedSign).toHaveBeenCalledWith(
      accessPayload,
      String(JWT_ACCESS_SECRET),
      {
        expiresIn: "15m",
      }
    );
  });
});

describe("check service", () => {
  const decoded = {
    id: "string",
  };
  const existingUser = {
    ...createdUser,
    id: decoded.id,
  };
  const returnValue = { isLoggedIn: true };

  beforeEach(() => {
    jest.resetAllMocks();

    mockedPrisma.tokens.findUnique.mockResolvedValue(resolvedToken);
    mockedVerify.mockReturnValue(decoded);
    mockedPrisma.users.findFirst.mockResolvedValue(existingUser);
  });

  it("should return login status", async () => {
    const result = await CheckService(refreshToken);

    expect(mockedPrisma.tokens.findUnique).toHaveBeenCalledWith({
      where: { token: refreshToken },
    });
    expect(mockedVerify).toHaveBeenCalledWith(
      refreshToken,
      String(JWT_REFRESH_SECRET)
    );
    expect(mockedPrisma.users.findFirst).toHaveBeenCalledWith({
      where: { id: decoded.id },
    });

    expect(result).toEqual(returnValue);
  });

  it("should throw error if refresh token not found", async () => {
    const error = new AppError("Session not found. Please log in again", 401);
    mockedPrisma.tokens.findUnique.mockResolvedValue(null);

    await expect(CheckService(refreshToken)).rejects.toThrow(error);

    expect(mockedPrisma.tokens.findUnique).toHaveBeenCalledWith({
      where: { token: refreshToken },
    });
    expect(mockedVerify).not.toHaveBeenCalled();
    expect(mockedPrisma.users.findFirst).not.toHaveBeenCalled();
  });

  it("should throw error if refresh token in the database marked as invalid", async () => {
    const error = new AppError("Session is invalid. Please log in again", 401);

    mockedPrisma.tokens.findUnique.mockResolvedValue({
      ...resolvedToken,
      isValid: false,
    });

    await expect(CheckService(refreshToken)).rejects.toThrow(error);

    expect(mockedPrisma.tokens.findUnique).toHaveBeenCalledWith({
      where: { token: refreshToken },
    });
    expect(mockedVerify).not.toHaveBeenCalled();
    expect(mockedPrisma.users.findFirst).not.toHaveBeenCalled();
  });

  it("should throw error if the verify token throw expired", async () => {
    const error = new TokenExpiredError("Token Expired", new Date());

    mockedVerify.mockImplementation(() => {
      throw error;
    });

    await expect(CheckService(refreshToken)).rejects.toThrow(
      new AppError("Session expired. Please log in again", 401)
    );

    expect(mockedPrisma.tokens.findUnique).toHaveBeenCalledWith({
      where: { token: refreshToken },
    });
    expect(mockedVerify).toHaveBeenCalledWith(
      refreshToken,
      String(JWT_REFRESH_SECRET)
    );
    expect(mockedPrisma.users.findFirst).not.toHaveBeenCalled();
  });

  it("should throw error if the verify token throw invalid", async () => {
    const error = new JsonWebTokenError("Invalid Token");

    mockedVerify.mockImplementation(() => {
      throw error;
    });

    await expect(CheckService(refreshToken)).rejects.toThrow(
      new AppError("Invalid session token. Please log in again", 401)
    );

    expect(mockedPrisma.tokens.findUnique).toHaveBeenCalledWith({
      where: { token: refreshToken },
    });
    expect(mockedVerify).toHaveBeenCalledWith(
      refreshToken,
      String(JWT_REFRESH_SECRET)
    );
    expect(mockedPrisma.users.findFirst).not.toHaveBeenCalled();
  });

  it("should throw error if the user not found", async () => {
    const error = new AppError("user not found", 404);

    mockedPrisma.users.findFirst.mockResolvedValue(null);

    await expect(CheckService(refreshToken)).rejects.toThrow(error);

    expect(mockedPrisma.tokens.findUnique).toHaveBeenCalledWith({
      where: { token: refreshToken },
    });
    expect(mockedVerify).toHaveBeenCalledWith(
      refreshToken,
      String(JWT_REFRESH_SECRET)
    );
    expect(mockedPrisma.users.findFirst).toHaveBeenCalledWith({
      where: { id: decoded.id },
    });
  });
});
