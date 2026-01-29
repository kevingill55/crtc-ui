"use server";

import { mg } from "@/app/clients/mailgun";

export async function sendMassEmail(formData: FormData) {
  const DOMAIN = process.env.MAILGUN_DOMAIN as string;
  const subject = formData.get("subject") as string;
  const body = formData.get("body") as string;
  const recipientString = formData.get("recipients") as string;

  const recipientList = recipientString
    .split(", ")
    .map((email) => email.trim());

  try {
    const messageData = {
      from: "Charles River Tennis Club <info@charlesrivertennisclub.com>",
      to: recipientList,
      subject,
      html: body,
      "recipient-variables": JSON.stringify(
        recipientList.reduce(
          (acc, email) => ({ ...acc, [email]: { id: 1 } }),
          {}
        )
      ),
    };

    await mg.messages.create(DOMAIN, messageData);
    return {
      success: true,
      message: `Successfully queued ${recipientList.length} emails.`,
    };
  } catch (error) {
    console.error("Mailgun Error:", error);
    return { success: false };
  }
}
