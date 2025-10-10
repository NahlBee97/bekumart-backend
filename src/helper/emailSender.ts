import path from "path";
import fs from "fs";
import handlebars from "handlebars";
import { Transporter } from "../utils/nodemailer";
import { IOrder } from "../interfaces/orderInterfaces";
import { FE_URL, JWT_ACCESS_SECRET } from "../config";
import { sign } from "jsonwebtoken";
import { AppError } from "../utils/appError";

export async function sendOrderStatusUpdateEmail(order: IOrder) {
  try {
    // 1. Define the path to your new Handlebars template
    const templatePath = path.join(__dirname, "../emails", "orderUpdate.hbs");

    // 2. Read and compile the template
    const templateSource = fs.readFileSync(templatePath, "utf-8");
    const compiledTemplate = handlebars.compile(templateSource);

    // 3. Prepare the data
    const templateData = {
      // ... same data as before
      customerName: order.user.name,
      orderId: order.id,
      status: order.status.replace("_", " "),
      // ... etc.
    };

    // 4. Render the HTML
    const html = compiledTemplate(templateData);

    // 5. Send the email
    await Transporter.sendMail({
      from: '"Bekumart" <noreply@bekumart.com>',
      to: order.user.email,
      subject: `Update on your order #${order.id}`,
      html,
    });
  } catch (error) {
    // Re-throw a standardized error so the calling function can handle it
    throw new AppError("Could not send order update email.", 500);
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
      from: "EOHelper",
      to: email,
      subject: "Reset Password",
      html,
    });
  } catch (error) {
    // Re-throw a standardized error
    throw new AppError("Could not send password reset email.", 500);
  }
}