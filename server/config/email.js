// email.js
import dotenv from "dotenv";
import { Resend } from "resend";

dotenv.config();

if (!process.env.RESEND_API_KEY) {
  console.error("❌ RESEND_API_KEY is missing in .env");
}

const resend = new Resend(process.env.RESEND_API_KEY);

// Create a fake "transporter" with a sendMail method similar to Nodemailer
const transporter = {
  /**
   * sendMail(options)
   * options: { from?, to, subject, text?, html? }
   */
  async sendMail(options) {
    const {
      from,
      to,
      subject,
      text,
      html,
    } = options;

    try {
      const { data, error } = await resend.emails.send({
        from: from || process.env.EMAIL_FROM, // fallback to default FROM
        to,
        subject,
        text,
        html,
      });

      if (error) {
        console.error("❌ Resend send error:", error);
        throw error;
      }

      // Mimic Nodemailer's response shape a bit
      return {
        messageId: data?.id,
        accepted: Array.isArray(to) ? to : [to],
        rejected: [],
        response: "Message sent via Resend",
      };
    } catch (err) {
      console.error("❌ Resend sendMail exception:", err);
      throw err;
    }
  },
};

export default transporter;
