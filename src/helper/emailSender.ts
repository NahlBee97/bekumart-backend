import path from "path";
import fs from "fs";
import handlebars from "handlebars";
import { Transporter } from "../utils/nodemailer";
import { IOrder } from "../interfaces/orderInterfaces";

export async function sendOrderStatusUpdateEmail(order: IOrder) {
  try {
    // 1. Define the path to your new Handlebars template
    const templatePath = path.join(
      __dirname,
      "../emails", // Or wherever your templates are stored
      "orderUpdate.hbs"
    );

    // 2. Read and compile the template
    const templateSource = fs.readFileSync(templatePath, "utf-8");
    const compiledTemplate = handlebars.compile(templateSource);

    // 3. Prepare the comprehensive data object for the template
    const templateData = {
      customerName: order.user.name,
      orderId: order.id,
      status: order.status.replace("_", " "), // Format status for display
      orderUrl: `https://your-frontend-url.com/orders/${order.id}`, // Your actual frontend URL

      // Set boolean flags for conditional sections in the template
      isProcessing: order.status === "PROCESSING",
      isOutForDelivery: order.status === "OUT_FOR_DELIVERY",
      isReadyForPickup: order.status === "READY_FOR_PICKUP",
      isCompleted: order.status === "COMPLETED",
      isCanceled: order.status === "CANCELLED",

      // Dynamically set the color for the status badge
      statusColor:
        {
          PENDING: "#4A90E2", // Blue
          PROCESSING: "#4A90E2", // Blue
          OUT_FOR_DELIVERY: "#F5A623", // Orange
          READY_FOR_PICKUP: "#7ED321", // Light Green
          COMPLETED: "#2ECC71", // Dark Green
          CANCELLED: "#D0021B", // Red
        }[order.status] || "#888", // Default gray

      // Pass through other required data
      trackingNumber: order.id || "N/A",
      items: order.items,
      total: order.totalAmount,

      // Footer information
      companyName: "Bekumart",
      companyAddress: "Jl. Sudirman No. 52, Jakarta Selatan",
      currentYear: new Date().getFullYear().toString(),
    };

    // 4. Render the HTML with the data
    const html = compiledTemplate(templateData);

    // 5. Send the email using your Nodemailer transporter
    await Transporter.sendMail({
      from: '"Bekumart" <noreply@bekumart.com>',
      to: order.user.email,
      subject: `Update on your order #${order.id}`,
      html,
    });

    console.log(`Order update email sent successfully to ${order.user.email}`);
  } catch (err) {
    console.error("Error sending order update email:", err);
    throw err;
  }
}