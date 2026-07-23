import nodemailer from "nodemailer";

function getTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    return null;
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_PORT === "465",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

export async function sendPasswordResetEmail(to: string, name: string, resetUrl: string) {
  const transporter = getTransporter();

  if (!transporter) {
    // SMTP isn't configured yet — log the link so the flow is still testable in dev.
    console.warn(`[email] SMTP not configured. Password reset link for ${to}:\n${resetUrl}`);
    return;
  }

  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #01574A;">Reset your MysTrip password</h2>
      <p>Hey ${name.split(" ")[0]},</p>
      <p>We got a request to reset your MysTrip password. This link expires in 1 hour.</p>
      <p style="margin: 24px 0;">
        <a href="${resetUrl}" style="background: #FF6016; color: #fff; padding: 12px 24px; border-radius: 999px; text-decoration: none; font-weight: bold;">
          Reset Password
        </a>
      </p>
      <p style="color: #888; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM ?? `"MysTrip" <${process.env.SMTP_USER}>`,
      to,
      subject: "Reset your MysTrip password",
      html,
    });
  } catch (err) {
    console.error("[email] Failed to send password reset email:", err);
    console.warn(`[email] Reset link for ${to}:\n${resetUrl}`);
  }
}
