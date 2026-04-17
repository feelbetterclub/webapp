import { Resend } from "resend";

/**
 * Email service for Feel Better Club.
 *
 * Silently no-ops if RESEND_API_KEY is not set — this keeps local dev safe
 * and prevents prod crashes if envs are misconfigured. Errors are logged but
 * never thrown: email failure must not block the user-facing action that
 * triggered it (signup, booking).
 */

const FROM = process.env.EMAIL_FROM || "Feel Better Club <hello@feelbetterclub.com>";

function getClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

async function send(to: string, subject: string, html: string): Promise<void> {
  const client = getClient();
  if (!client) {
    console.warn(`[email] RESEND_API_KEY not set; skipping email to ${to}`);
    return;
  }
  try {
    await client.emails.send({ from: FROM, to, subject, html });
  } catch (err) {
    console.error(`[email] failed to send to ${to}:`, err);
  }
}

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapper(inner: string): string {
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>Feel Better Club</title></head>
<body style="margin:0;padding:0;background:#faf8f2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#062e21;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf8f2;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
        <tr><td style="background:#0d5e42;padding:32px;text-align:center;">
          <h1 style="margin:0;color:#f4ebd0;font-size:24px;letter-spacing:0.08em;">THE FEEL BETTER CLUB</h1>
        </td></tr>
        <tr><td style="padding:40px 32px;line-height:1.7;font-size:16px;color:#062e21;">
          ${inner}
        </td></tr>
        <tr><td style="padding:24px 32px;background:#f4ebd0;text-align:center;font-size:12px;color:#094a34;">
          Nature · Connection · Fun &middot; Tarifa, ES
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

// ---------- Welcome email (community signup) ----------

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  const safeName = escape(name || "there");
  const subject = "Welcome — your outdoor training journey starts here";
  const inner = `
    <p>Hi ${safeName},</p>
    <p>I'm genuinely excited to have you with us. The Feel Better Club was created with one simple intention: to bring people together through movement, nature, and the kind of energy that only shared effort can create.</p>
    <p>Every session is designed to feel uplifting and connected — whether we're training on the beach at sunrise, doing mobility at sunset, or challenging ourselves in the forest at midday. My goal is to make each workout something you look forward to, not just for the training itself, but for the atmosphere and the people around you.</p>
    <p>By joining, you're not just signing up for workouts. You're becoming part of a community that supports each other, grows together, and enjoys the outdoors as our "gym". I'm grateful to have you with us.</p>
    <p>As a welcome gift, you'll receive the details about date and time for your free outdoor class in a separate message shortly. I can't wait for you to experience it and give us feedback. You'll also get updates about special events and holistic health tips fueled by science.</p>
    <p>You'll receive weekly updates with the schedule, sign-ups, and any special sessions or events. And of course, you can always reach out if you have questions or ideas — this community grows stronger when we build it together.</p>
    <p style="margin-top:32px;">See you outside.<br/><strong>Monika</strong><br/><em>Feel Better Coach &amp; Founder</em></p>
  `;
  await send(to, subject, wrapper(inner));
}

// ---------- Booking confirmation email ----------

export interface BookingConfirmationData {
  to: string;
  userName: string;
  date: string; // ISO date e.g. 2026-04-20
  time: string; // "09:00"
  classType: string;
  cancelUrl?: string;
}

export async function sendBookingConfirmation(data: BookingConfirmationData): Promise<void> {
  const { to, userName, date, time, classType, cancelUrl } = data;
  const subject = "Your Spot Is Confirmed — See You Outdoors";
  const safeName = escape(userName || "there");
  const safeClass = escape(classType);
  const safeDate = escape(date);
  const safeTime = escape(time);

  const cancelBlock = cancelUrl
    ? `<p>If your plans change, you can cancel up to 12 hours before the class using the link below:</p>
       <p><a href="${cancelUrl}" style="color:#0d5e42;text-decoration:underline;">${escape(cancelUrl)}</a></p>`
    : "";

  const inner = `
    <p>Hi ${safeName},</p>
    <p>Thank you for choosing us and your reservation. You are the reason why I show up every day to lead a class and I am excited to train with you.</p>
    <p><strong>Your booking:</strong></p>
    <ul style="padding-left:20px;margin:12px 0;">
      <li><strong>Date:</strong> ${safeDate}</li>
      <li><strong>Time:</strong> ${safeTime}</li>
      <li><strong>Class:</strong> ${safeClass}</li>
    </ul>
    ${cancelBlock}
    <p style="margin-top:32px;">Let's grow and Feel Better — together :)<br/><strong>Moni</strong></p>
  `;
  await send(to, subject, wrapper(inner));
}
