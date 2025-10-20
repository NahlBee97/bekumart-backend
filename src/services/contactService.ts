import { SendEmail } from "../helper/emailSender";

export async function ContactService(data: {
  name: string;
  email: string;
  message: string;
}) {
  await SendEmail(data);
}
