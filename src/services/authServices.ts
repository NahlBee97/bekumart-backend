import bcrypt, { genSaltSync, hash } from "bcryptjs";
import { ILogin, IRegister } from "../interfaces/authInterfaces";
import { prisma } from "../lib/prisma";
import { JWT_SECRET } from "../config";
import jwt, { JwtPayload, verify } from "jsonwebtoken";
import { FindUserByEmail } from "../helper/findUserByEmail";
import { AppError } from "../utils/appError";

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

  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isVerified: user.isVerified,
    imageUrl: user.imageUrl,
  };

  const token = jwt.sign(payload, String(JWT_SECRET), { expiresIn: "1h" });

  if (!token) throw new AppError("Failed to generate token", 500);

  return token;
}

export async function SetPasswordService(password: string, token: string) {
  let email: string;

  try {
    const decoded = verify(token, String(JWT_SECRET)) as JwtPayload;
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
        id: user.id
      },
      data: {
        password: hashedPassword
      }
    });
  } catch (error) {
    throw new AppError("Could not update password.", 500);
  }
}
