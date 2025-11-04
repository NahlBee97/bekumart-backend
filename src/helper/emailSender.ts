import path from "path";
import fs from "fs";
import handlebars from "handlebars";
import { Transporter } from "../utils/nodemailer";
import { IOrder } from "../interfaces/orderInterfaces";
import { FE_URL, JWT_ACCESS_SECRET } from "../config";
import { sign } from "jsonwebtoken";

export async function sendOrderStatusUpdateEmail(order: IOrder) {
  try {
    const templatePath = path.join(__dirname, "../emails", "orderUpdate.hbs");

    const templateSource = fs.readFileSync(templatePath, "utf-8");
    const compiledTemplate = handlebars.compile(templateSource);

    const templateData = {
      customerName: order.user.name,
      orderId: order.id,
      status: order.status.replace("_", " "),
    };

    const html = compiledTemplate(templateData);

    await Transporter.sendMail({
      from: '"Bekumart" <noreply@bekumart.com>',
      to: order.user.email,
      subject: `Update on your order ${order.id}`,
      html,
    });
  } catch (error) {
    throw error;
  }
}

export async function VerifyResetPasswordEmail(email: string) {
  try {
    const templatePath = path.join(
      __dirname,
      "../emails",
      "verify-reset-template.hbs"
    );

    const payload = { email };
    const token = sign(payload, String(JWT_ACCESS_SECRET), { expiresIn: "1h" });

    const templateSource = fs.readFileSync(templatePath, "utf-8");
    const compiledTemplate = handlebars.compile(templateSource);

    const html = compiledTemplate({
      email,
      fe_url: `${FE_URL}/reset-password/${token}`,
    });

    await Transporter.sendMail({
      from: "Bekumart",
      to: email,
      subject: "Reset Password",
      html,
    });
  } catch (error) {
    throw error;
  }
}

export async function SendEmail(data: {
  email: string;
  name: string;
  message: string;
}) {
  try {
    const { email, name, message } = data;

    const templatePath = path.join(
      __dirname,
      "../emails",
      "sendEmail.hbs"
    );

    const templateSource = fs.readFileSync(templatePath, "utf-8");
    const compiledTemplate = handlebars.compile(templateSource);

    const html = compiledTemplate({
      email,
      name,
      message
    });

    await Transporter.sendMail({
      from: name + ":" + email,
      to: "nahalilmuchtar2@gmail.com",
      replyTo: email,
      subject: `New Contact Form Submission from ${name}`,
      html,
    });
  } catch (error) {
    throw error;
  }
}
