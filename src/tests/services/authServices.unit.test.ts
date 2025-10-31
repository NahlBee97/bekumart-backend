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
} from "../../services/authServices";
import { FindUserByEmail } from "../../helper/findUserByEmail";
import { mockedPrisma } from "../mockPrisma";
import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } from "../../config";
import { AppError } from "../../utils/appError";
import { UserRoles } from "@prisma/client";
import { IRegister } from "../../interfaces/authInterfaces";

const registrationData: IRegister = {
  name: "nama",
  email: "nama@gmail.com",
  password: "password@123",
};

const loginData = {
  email: "nama@gmail.com",
  password: "Password@123",
};

const GoogleLoginData = {
  name: "string",
  email: "nama@gmail.com",
};

const hashedPassword = "hashedpassword";

const createdUser = {
  id: "string",
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

const existingUser = {
  ...createdUser,
  email: loginData.email,
};

const accessPayload = {
  id: existingUser.id,
  email: existingUser.email,
  name: existingUser.name,
  role: existingUser.role,
  isVerified: existingUser.isVerified,
  imageUrl: existingUser.imageUrl,
};

const refreshPayload = {
  id: existingUser.id,
  role: existingUser.role,
};

const token = "randomstring";
const accessToken = "randomstring";
const refreshToken = "randomstring";
const newPassword = "randomstring";

const resolvedToken = {
  id: "test",
  userId: "testuser",
  token: refreshToken,
  isValid: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

jest.mock("../../helper/findUserByEmail", () => ({
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
});

describe("Google Login Service", () => {
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

    const result = await GoogleLoginService(GoogleLoginData);

    expect(mockedFindUserByEmail).toHaveBeenCalledWith(loginData.email);

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

    const result = await GoogleLoginService(GoogleLoginData);

    expect(mockedFindUserByEmail).toHaveBeenCalledWith(GoogleLoginData.email);

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

  it("should throw a 'Failed to generate token' error if token signing fails", async () => {
    const tokenError = new AppError("Failed to generate token", 500);

    mockedSign.mockReturnValue(null);
    mockedSign.mockReturnValue(null);

    await expect(GoogleLoginService(GoogleLoginData)).rejects.toThrow(
      tokenError
    );

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
    mockedVerify.mockImplementation(() => {
      throw new TokenExpiredError(
        "Session expired. Please log in again",
        new Date()
      );
    });

    await expect(SetPasswordService(newPassword, token)).rejects.toThrow(
      "Session expired. Please log in again"
    );

    expect(mockedVerify).toHaveBeenCalledWith(token, String(JWT_ACCESS_SECRET));
    expect(mockedFindUserByEmail).not.toHaveBeenCalled();
  });

  it("should throw error if token is not valid", async () => {
    const invalidError = Error("Invalid token");

    mockedVerify.mockImplementation(() => {
      throw invalidError;
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
});

describe("refresh token service", () => {
  const decoded = {
    id: "string",
  };

  const existingUser = {
    ...createdUser,
    id: decoded.id,
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
      "Token Expired"
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
      "Invalid Token"
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
  });

  it("should return login status", async () => {
    mockedPrisma.tokens.findUnique.mockResolvedValue(resolvedToken);
    mockedVerify.mockReturnValue(decoded);
    mockedPrisma.users.findUnique.mockResolvedValue(existingUser);

    const result = await CheckService(refreshToken);

    expect(mockedPrisma.tokens.findUnique).toHaveBeenCalledWith({
      where: { token: refreshToken },
    });
    expect(mockedVerify).toHaveBeenCalledWith(
      refreshToken,
      String(JWT_REFRESH_SECRET)
    );
    expect(mockedPrisma.users.findUnique).toHaveBeenCalledWith({
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
  });

  it("should throw error if the verify token throw expired", async () => {
    const error = new TokenExpiredError("Token Expired", new Date());

    mockedPrisma.tokens.findUnique.mockResolvedValue(resolvedToken);

    mockedVerify.mockImplementation(() => {
      throw error;
    });

    await expect(CheckService(refreshToken)).rejects.toThrow("Token Expired");

    expect(mockedPrisma.tokens.findUnique).toHaveBeenCalledWith({
      where: { token: refreshToken },
    });
    expect(mockedVerify).toHaveBeenCalledWith(
      refreshToken,
      String(JWT_REFRESH_SECRET)
    );
  });

  it("should throw error if the verify token throw invalid", async () => {
    const error = new JsonWebTokenError("Invalid Token");

    mockedPrisma.tokens.findUnique.mockResolvedValue(resolvedToken);

    mockedVerify.mockImplementation(() => {
      throw error;
    });

    await expect(CheckService(refreshToken)).rejects.toThrow("Invalid Token");

    expect(mockedPrisma.tokens.findUnique).toHaveBeenCalledWith({
      where: { token: refreshToken },
    });
    expect(mockedVerify).toHaveBeenCalledWith(
      refreshToken,
      String(JWT_REFRESH_SECRET)
    );
  });

  it("should throw error if the user not found", async () => {
    const error = new AppError("user not found", 404);

    mockedPrisma.tokens.findUnique.mockResolvedValue(resolvedToken);
    mockedVerify.mockReturnValue(decoded);

    mockedPrisma.users.findUnique.mockResolvedValue(null);

    await expect(CheckService(refreshToken)).rejects.toThrow(error);

    expect(mockedPrisma.tokens.findUnique).toHaveBeenCalledWith({
      where: { token: refreshToken },
    });
    expect(mockedVerify).toHaveBeenCalledWith(
      refreshToken,
      String(JWT_REFRESH_SECRET)
    );
    expect(mockedPrisma.users.findUnique).toHaveBeenCalledWith({
      where: { id: decoded.id },
    });
    expect(mockedPrisma.users.findUnique).toHaveBeenCalledWith({
      where: { id: decoded.id },
    });
  });
});
