import bcrypt, { compare } from "bcryptjs";
import type { ILogin, IRegister } from "../interfaces/authInterfaces.ts";
import prisma from "../lib/prisma.ts";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.ts";

export async function FindUserByEmail(email: string) {
  try {
    const user = await prisma.user.findFirst({
      where: {
        email,
      },
    });
    return user;
  } catch (err) {
    throw err;
  }
}

async function Register(userData: IRegister) {
  try {
    const { name, email, password } = userData;

    const user = await FindUserByEmail(email);

    if (user) throw new Error("Email already registered");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.$transaction(async (t: any) => {
      const registeredUser = await t.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          updatedAt: new Date(),
        },
      });

      return registeredUser;
    });

    if (!newUser) throw new Error("Create account failed");

    return newUser;
  } catch (err) {
    throw err;
  }
}

async function Login(userData: ILogin) {
  try {
    const { email, password } = userData;

    const user = await FindUserByEmail(email);

    if (!user) throw new Error("Email does not exist");

    const checkPass = await compare(password, user.password as string);

    if (!checkPass) throw new Error("Incorrect Password");

    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isVerified: user.isVerified,
      image: user.imageUrl,
    };

    const token = jwt.sign(payload, String(JWT_SECRET), { expiresIn: "1h" });

    return token;
  } catch (err) {
    throw err;
  }
}

export async function RegisterService(userData: IRegister) {
  try {
    const newUser = await Register(userData);

    return newUser;
  } catch (err) {
    throw err;
  }
}

export async function LoginService(userData: ILogin) {
  try {
    const user = await Login(userData);

    if (!user) throw new Error("User not found");

    return user;
  } catch (err) {
    throw err;
  }
}