import { SendEmail } from "../helper/emailSender";

export async function ContactService(data: {
  name: string;
  email: string;
  message: string;
}) {
  try {
    await SendEmail(data);
  } catch (error) {
    throw error;
  }
}
