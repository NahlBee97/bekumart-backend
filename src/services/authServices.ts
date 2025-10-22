import bcrypt, { genSaltSync, hash } from "bcryptjs";
import { ILogin, IRegister } from "../interfaces/authInterfaces";
import { prisma } from "../lib/prisma";
import jwt, { JwtPayload, verify } from "jsonwebtoken";
import { FindUserByEmail } from "../helper/findUserByEmail";
import { AppError } from "../utils/appError";
import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } from "../config";

export async function RegisterService(userData: IRegister) {
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

    if (!createdUser) throw new AppError("Create new user failed", 500);

    const cart = await tx.carts.create({
      data: { userId: createdUser.id },
    });

    if (!cart) throw new AppError("Failed to create cart", 500);

    return createdUser;
  });

  return newUser;
}

export async function LoginService(userData: ILogin) {
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

  await prisma.tokens.updateMany({
    where: { userId: user.id },
    data: { isValid: false },
  });

  await prisma.tokens.create({
    data: {
      userId: user.id,
      token: refreshToken,
      updatedAt: new Date(),
    },
  });

  if (!accessToken && !refreshToken)
    throw new AppError("Failed to generate token", 500);

  return { accessToken, refreshToken };
}

export async function LogOutService(refreshToken: string) {
  await prisma.tokens.update({
    where: { token: refreshToken },
    data: { isValid: false },
  });
}

export async function SetPasswordService(password: string, token: string) {
  let email: string;

  try {
    const decoded = verify(token, String(JWT_ACCESS_SECRET)) as JwtPayload;
    email = decoded.email;
  } catch (error) {
    throw new AppError("Invalid or expired token.", 401);
  }

  const user = await FindUserByEmail(email);
  if (!user) throw new AppError("User not found.", 404);

  try {
    const salt = genSaltSync(10);
    const hashedPassword = await hash(password, salt);
    await prisma.users.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
      },
    });
  } catch (error) {
    throw new AppError("Could not update password.", 500);
  }
}

export async function RefreshTokenService(refreshToken: string) {
  const authToken = await prisma.tokens.findUnique({
    where: { token: refreshToken },
  });

  if (authToken?.isValid === false)
    throw new AppError("The refresh token is invalid", 401);

  const decoded = verify(
    refreshToken,
    String(JWT_REFRESH_SECRET)
  ) as JwtPayload;

  const userId = decoded.id;

  const user = await prisma.users.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) throw new AppError("User not found", 404);

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
}

export async function CheckService(refreshToken: string) {
  const authToken = await prisma.tokens.findUnique({
    where: { token: refreshToken },
  });

  if (authToken?.isValid === false)
    throw new AppError("The refresh token is invalid", 401);

  const decoded = verify(
    refreshToken,
    String(JWT_REFRESH_SECRET)
  ) as JwtPayload;

  const userId = decoded.id;

  const user = await prisma.users.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) throw new AppError("User not found", 404);

  return { isLoggedIn: true };
}
