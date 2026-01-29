import FormData from "form-data";
import Mailgun from "mailgun.js";

const mailgun = new Mailgun(FormData);

export const mg = mailgun.client({
  username: "api",
  key: process.env.NEXT_PUBLIC_MAILGUN_API_KEY as string,
  url: process.env.NEXT_PUBLIC_MAILGUN_URL || "https://api.mailgun.net",
});
