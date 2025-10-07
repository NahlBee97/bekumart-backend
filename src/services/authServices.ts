import bcrypt, { genSaltSync, hash } from "bcryptjs";
import { ILogin, IRegister } from "../interfaces/authInterfaces";
import { prisma } from "../lib/prisma";
import { FE_URL, JWT_SECRET } from "../config";
import jwt, { JwtPayload, sign, verify } from "jsonwebtoken";
import { FindUserByEmail } from "../helper/findUserByEmail";
import path from "path";
import fs from "fs";
import handlebars from "handlebars"
import { Transporter } from "../utils/nodemailer";

export async function RegisterService(userData: IRegister) {
  try {
    const { name, email, password } = userData;

    const existingUser = await FindUserByEmail(email);

    if (existingUser) throw new Error("Email already registered");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (!hashedPassword) throw new Error("Failed hashing password")

    const newUser = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.users.create({
        data: {
          name,
          email,
          password: hashedPassword,
          updatedAt: new Date(),
        },
      });

      if (!createdUser) throw new Error("Create new user failed");

      const cart = await tx.carts.create({
        data: { userId: createdUser.id },
      });

      if (!cart) throw new Error("Failed to create cart");

      return createdUser;
    });

    return newUser;
  } catch (err) {
    throw err;
  }
}

export async function LoginService(userData: ILogin) {
  try {
    const { email, password } = userData;

    const user = await FindUserByEmail(email);

    if (!user) throw new Error("User not found");

    const checkPass = await bcrypt.compare(password, user.password as string);

    if (!checkPass) throw new Error("Incorrect Password");

    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isVerified: user.isVerified,
      imageUrl: user.imageUrl,
    };

    const token = jwt.sign(payload, String(JWT_SECRET), { expiresIn: "1h" });

    if(!token) throw new Error ("Failed to generate token");

    return token;
  } catch (err) {
    throw err;
  }
}

export async function VerifyResetService(email: string) {
  try {
    const templatePath = path.join(
      __dirname,
      "../emails",
      "verify-reset-template.hbs"
    );

    const payload = {
      email,
    };

    const token = sign(payload, String(JWT_SECRET), { expiresIn: "1h" });

    const templateSource = fs.readFileSync(templatePath, "utf-8");
    const compiledTemplate = handlebars.compile(templateSource);

    const html = compiledTemplate({
      email,
      fe_url: `${FE_URL}/reset-password/${token}`,
    });

    await Transporter.sendMail({
      from: "EOHelper",
      to: email,
      subject: "Reset Password",
      html,
    });
  } catch (err) {
    throw err;
  }
}

export async function SetPasswordService(password: string, token: string) {
  try {
    const { email } = verify(token, String(JWT_SECRET)) as JwtPayload;

    const user = await FindUserByEmail(email);

    if (!user) throw new Error("User does not exist");

    const salt = genSaltSync(10);
    const hashedPassword = await hash(password, salt);

    await prisma.users.update({
      where: {
        email,
      },
      data: {
        password: hashedPassword,
      },
    });
  } catch (err) {
    throw err;
  }
}
