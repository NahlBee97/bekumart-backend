import bcrypt, { genSaltSync, hash } from "bcryptjs";
import { ILogin, IRegister } from "../interfaces/authInterfaces";
import { prisma } from "../lib/prisma";
import jwt, { JwtPayload, verify } from "jsonwebtoken";
import { FindUserByEmail } from "../helper/findUserByEmail";
import { AppError } from "../utils/appError";
import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } from "../config";

export async function RegisterService(userData: IRegister) {
  try {
    const { name, email, password } = userData;

    const existingUser = await FindUserByEmail(email);

    if (existingUser) throw new AppError("Email already registered", 409);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (!hashedPassword) throw new AppError("Failed hashing password", 500);

    const newUser = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.users.create({
        data: {
          name,
          email,
          password: hashedPassword,
          updatedAt: new Date(),
        },
      });

      await tx.carts.create({
        data: { userId: createdUser.id },
      });

      return createdUser;
    });

    return newUser;
  } catch (error) {
    throw error;
  }
}

export async function LoginService(userData: ILogin) {
  try {
    const { email, password } = userData;

    const user = await FindUserByEmail(email);

    if (!user) throw new AppError("User not found", 404);

    const checkPass = await bcrypt.compare(password, user.password as string);

    if (!checkPass) throw new AppError("Incorrect Password", 401);

    const accessPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isVerified: user.isVerified,
      imageUrl: user.imageUrl,
    };

    const refreshPayload = {
      id: user.id,
      role: user.role,
    };

    const accessToken = jwt.sign(accessPayload, String(JWT_ACCESS_SECRET), {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign(refreshPayload, String(JWT_REFRESH_SECRET), {
      expiresIn: "7d",
    });

    if (!accessToken || !refreshToken)
      throw new AppError("Failed to generate token", 500);

    await prisma.$transaction(async (tx) => {
      await tx.tokens.updateMany({
        where: { userId: user.id },
        data: { isValid: false },
      });

      await tx.tokens.create({
        data: {
          userId: user.id,
          token: refreshToken,
          updatedAt: new Date(),
        },
      });
    });

    return { accessToken, refreshToken };
  } catch (error) {
    throw error;
  }
}

export async function GoogleLoginService(userData: {
  name: string;
  email: string;
}) {
  try {
    const { name, email } = userData;

    const user = await FindUserByEmail(email);

    let newUser = user;

    if (!user) {
      newUser = await prisma.$transaction(async (tx) => {
        const createdUser = await tx.users.create({
          data: {
            name,
            email,
          },
        });

        await tx.carts.create({
          data: { userId: createdUser.id },
        });

        return createdUser;
      });
    }

    const accessPayload = {
      id: newUser?.id,
      email: newUser?.email,
      name: newUser?.name,
      role: newUser?.role,
      isVerified: newUser?.isVerified,
      imageUrl: newUser?.imageUrl,
    };

    const refreshPayload = {
      id: newUser?.id,
      role: newUser?.role,
    };

    const accessToken = jwt.sign(accessPayload, String(JWT_ACCESS_SECRET), {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign(refreshPayload, String(JWT_REFRESH_SECRET), {
      expiresIn: "7d",
    });

    if (!accessToken || !refreshToken)
      throw new AppError("Failed to generate token", 500);

    await prisma.$transaction(async (tx) => {
      await tx.tokens.updateMany({
        where: { userId: newUser?.id },
        data: { isValid: false },
      });

      await tx.tokens.create({
        data: {
          userId: newUser?.id as string,
          token: refreshToken as string,
          updatedAt: new Date(),
        },
      });
    });
    return { accessToken, refreshToken };
  } catch (error) {
    throw error;
  }
}

export async function LogOutService(refreshToken: string) {
  try {
    const authToken = await prisma.tokens.findUnique({
      where: { token: refreshToken },
    });

    if (!authToken) return;

    if (authToken?.isValid === false) return;

    await prisma.tokens.update({
      where: { token: refreshToken },
      data: { isValid: false },
    });
  } catch (error) {
    throw error;
  }
}

export async function SetPasswordService(password: string, token: string) {
  try {
    const decoded = verify(token, String(JWT_ACCESS_SECRET)) as JwtPayload;

    const user = await FindUserByEmail(decoded.email);
    if (!user) throw new AppError("User not found.", 404);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (!hashedPassword) throw new AppError("Failed hashing password", 500);

    await prisma.users.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
      },
    });
  } catch (error) {
    throw error;
  }
}

export async function RefreshTokenService(refreshToken: string) {
  try {
    const authToken = await prisma.tokens.findUnique({
      where: { token: refreshToken },
    });

    if (!authToken) {
      throw new AppError("Session not found. Please log in again", 401);
    }

    if (authToken.isValid === false) {
      throw new AppError("Session is invalid. Please log in again", 401);
    }

    const decoded = verify(
      refreshToken,
      String(JWT_REFRESH_SECRET)
    ) as JwtPayload;

    const user = await prisma.users.findFirst({
      where: {
        id: decoded.id,
      },
    });

    if (!user) throw new AppError("user not found", 404);

    const accessPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isVerified: user.isVerified,
      imageUrl: user.imageUrl,
    };

    const accessToken = jwt.sign(accessPayload, String(JWT_ACCESS_SECRET), {
      expiresIn: "15m",
    });

    if (!accessToken) throw new AppError("Failed to generate token", 500);

    return accessToken;
  } catch (error) {
    throw error;
  }
}

export async function CheckService(refreshToken: string) {
  try {
    const authToken = await prisma.tokens.findUnique({
      where: { token: refreshToken },
    });

    if (!authToken) {
      throw new AppError("Session not found. Please log in again", 401);
    }

    if (authToken.isValid === false) {
      throw new AppError("Session is invalid. Please log in again", 401);
    }

    const decoded = verify(
      refreshToken,
      String(JWT_REFRESH_SECRET)
    ) as JwtPayload;

    const userId = decoded.id;

    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError("user not found", 404);
    }

    return { isLoggedIn: true };
  } catch (error) {
    throw error;
  }
}
