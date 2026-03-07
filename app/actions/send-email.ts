"use server";

import { mg } from "@/app/clients/mailgun";

export async function sendTestEmail(formData: FormData) {
  const DOMAIN = process.env.MAILGUN_DOMAIN as string;
  const subject = formData.get("subject") as string;
  const body = formData.get("body") as string;
  const to = formData.get("to") as string;

  try {
    await mg.messages.create(DOMAIN, {
      from: "Charles River Tennis Club <info@charlesrivertennisclub.com>",
      to,
      subject: `[TEST] ${subject}`,
      html: body,
    });
    return { success: true };
  } catch (error) {
    console.error("Mailgun Error:", error);
    return { success: false };
  }
}

export async function sendMassEmail(formData: FormData) {
  const DOMAIN = process.env.MAILGUN_DOMAIN as string;
  const subject = formData.get("subject") as string;
  const body = formData.get("body") as string;
  const bccString = formData.get("bcc") as string;

  const bccList = bccString.split(", ").map((email) => email.trim());

  try {
    const messageData = {
      from: "Charles River Tennis Club <info@charlesrivertennisclub.com>",
      to: "info@charlesrivertennisclub.com",
      bcc: bccList.join(", "),
      subject,
      html: body,
    };

    await mg.messages.create(DOMAIN, messageData);
    return {
      success: true,
      message: `Successfully queued ${bccList.length} emails.`,
    };
  } catch (error) {
    console.error("Mailgun Error:", error);
    return { success: false };
  }
}
