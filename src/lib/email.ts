import { Resend } from "resend";

/**
 * Email service for Feel Better Club.
 *
 * Silently no-ops if RESEND_API_KEY is not set — this keeps local dev safe
 * and prevents prod crashes if envs are misconfigured. Errors are logged but
 * never thrown: email failure must not block the user-facing action that
 * triggered it (signup, booking).
 */

const FROM = process.env.EMAIL_FROM || "Feel Better Club <hello@thefeelbetterclub.com>";

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
          <img src="https://thefeelbetterclub.com/logo-v4-white-hd.png" alt="Feel Better Club" height="40" style="height:40px;width:auto;" />
        </td></tr>
        <tr><td style="padding:40px 32px;line-height:1.7;font-size:16px;color:#062e21;">
          ${inner}
        </td></tr>
        <tr><td style="padding:24px 32px;background:#f4ebd0;text-align:center;font-size:12px;color:#094a34;">
          Nature · Connection · Fun
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
    <p>By joining, you're not just signing up for workouts. You're becoming part of a Feel Better Community that supports each other, grows together, and enjoys the outdoors as our "gym". I'm grateful to have you with us.</p>
    <p>As a welcome gift, you'll receive the details about date and time for your free outdoor class in a separate message shortly. I can't wait for you to experience it and give us feedback.</p>
    <p>As a member you can easily book a class or manage your reservations. You also get premium access to special events, sport nutrition tips and holistic health rituals. And of course, you can always reach out if you have questions or ideas — this community grows stronger when we build it together.</p>
    <p style="margin-top:32px;">See you outside.<br/><strong>Moni</strong><br/><em>Feel Better Coach &amp; Founder</em></p>
  `;
  await send(to, subject, wrapper(inner));
}

// ---------- Waitlist confirmation email ----------

export interface WaitlistConfirmationData {
  to: string;
  userName: string;
  date: string;
  time: string;
  classType: string;
  position: number;
}

export async function sendWaitlistConfirmation(data: WaitlistConfirmationData): Promise<void> {
  const { to, userName, date, time, classType, position } = data;
  const subject = "You're on the Waitlist — We'll Let You Know";
  const safeName = escape(userName || "there");
  const safeClass = escape(classType);
  const safeDate = escape(date);
  const safeTime = escape(time);

  const inner = `
    <p>Hi ${safeName},</p>
    <p>Thanks for your interest in joining us! The class is currently full, but you're on the waitlist.</p>
    <p><strong>Your waitlist details:</strong></p>
    <ul style="padding-left:20px;margin:12px 0;">
      <li><strong>Class:</strong> ${safeClass}</li>
      <li><strong>Date:</strong> ${safeDate}</li>
      <li><strong>Time:</strong> ${safeTime}</li>
      <li><strong>Status:</strong> On the waitlist</li>
    </ul>
    <p>If a spot opens up, you'll receive a confirmation email automatically with all the details and a cancellation link. No action needed from your side — just keep your fingers crossed!</p>
    <p style="margin-top:32px;">See you soon, hopefully!<br/><strong>Moni</strong></p>
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
    <p>Thank you for choosing Feel Better Club and your reservation. I am excited to train with you. You are the reason why I show up every day to create the space where you can discover your inner Power and Connect with your true potential.</p>
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

// ---------- Contact form notification (to coach) ----------

const COACH_EMAIL = "feelbettermove@gmail.com";

export interface ContactNotificationData {
  name: string;
  email: string;
  phone?: string;
  preferredContact: string;
  message: string;
}

export async function sendContactNotification(data: ContactNotificationData): Promise<void> {
  const { name, email, phone, preferredContact, message } = data;
  const subject = "New Contact Message — Feel Better Club";
  const safeName = escape(name);
  const safeEmail = escape(email);
  const safePhone = phone ? escape(phone) : null;
  const safePreferred = escape(preferredContact);
  const safeMessage = escape(message);

  const phoneRow = safePhone
    ? `<li><strong>Phone:</strong> ${safePhone}</li>`
    : "";

  const inner = `
    <p>You have received a new contact message from your website.</p>
    <p><strong>Sender details:</strong></p>
    <ul style="padding-left:20px;margin:12px 0;">
      <li><strong>Name:</strong> ${safeName}</li>
      <li><strong>Email:</strong> ${safeEmail}</li>
      ${phoneRow}
      <li><strong>Preferred contact:</strong> ${safePreferred}</li>
    </ul>
    <p><strong>Message:</strong></p>
    <p style="background:#f4ebd0;padding:16px;border-radius:8px;white-space:pre-wrap;">${safeMessage}</p>
  `;
  await send(COACH_EMAIL, subject, wrapper(inner));
}

// ---------- Anonymous message notification (to coach) ----------

export interface MessageNotificationData {
  text: string;
  replyEmail?: string | null;
}

export async function sendMessageNotification(data: MessageNotificationData): Promise<void> {
  const { text, replyEmail } = data;
  const subject = "New Message — Feel Better Club";
  const safeText = escape(text);
  const timestamp = escape(new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC");

  const replyBlock = replyEmail
    ? `<p><strong>Reply to:</strong> <a href="mailto:${escape(replyEmail)}" style="color:#0d5e42;">${escape(replyEmail)}</a></p>`
    : `<p><em>No reply email provided — this message is anonymous.</em></p>`;

  const inner = `
    <p>A new anonymous message has been submitted via the "Ask us anything" form.</p>
    <blockquote style="border-left:4px solid #0d5e42;margin:16px 0;padding:12px 16px;background:#f4ebd0;border-radius:4px;font-style:italic;">
      ${safeText}
    </blockquote>
    ${replyBlock}
    <p style="font-size:13px;color:#555;margin-top:24px;"><strong>Received:</strong> ${timestamp}</p>
  `;
  await send(COACH_EMAIL, subject, wrapper(inner));
}

// ---------- On-demand class request — user confirmation (FBC-70) ----------

export interface OnDemandConfirmationData {
  to: string;
  userName: string;
  groupSize?: string;
  preferredDate?: string;
}

export async function sendOnDemandConfirmation(data: OnDemandConfirmationData): Promise<void> {
  const { to, userName, groupSize, preferredDate } = data;
  const subject = "Your Request Has Been Received — Feel Better Club";
  const safeName = escape(userName || "there");

  const detailRows = [
    groupSize ? `<li><strong>Group size:</strong> ${escape(groupSize)}</li>` : "",
    preferredDate ? `<li><strong>Preferred date:</strong> ${escape(preferredDate)}</li>` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const detailBlock = detailRows
    ? `<p><strong>Your request details:</strong></p>
       <ul style="padding-left:20px;margin:12px 0;">
         ${detailRows}
       </ul>`
    : "";

  const inner = `
    <p>Hi ${safeName},</p>
    <p>Thank you for reaching out! We've received your on-demand class request and we're excited to make it happen.</p>
    ${detailBlock}
    <p>Moni will review your request and get back to you shortly to confirm the details and arrange everything just right for you.</p>
    <p>In the meantime, if you have any questions feel free to reply to this email.</p>
    <p style="margin-top:32px;">See you outside!<br/><strong>Moni</strong><br/><em>Feel Better Coach &amp; Founder</em></p>
  `;
  await send(to, subject, wrapper(inner));
}

// ---------- On-demand class request — coach lead notification (FBC-71) ----------

export interface OnDemandLeadData {
  userName: string;
  userEmail: string;
  userPhone?: string;
  groupSize?: string;
  preferredDate?: string;
  notes?: string;
}

export async function sendOnDemandLeadNotification(data: OnDemandLeadData): Promise<void> {
  const { userName, userEmail, userPhone, groupSize, preferredDate, notes } = data;
  const subject = "New On-Demand Class Request";

  const rows = [
    `<li><strong>Name:</strong> ${escape(userName)}</li>`,
    `<li><strong>Email:</strong> ${escape(userEmail)}</li>`,
    userPhone ? `<li><strong>Phone:</strong> ${escape(userPhone)}</li>` : "",
    groupSize ? `<li><strong>Group size:</strong> ${escape(groupSize)}</li>` : "",
    preferredDate ? `<li><strong>Preferred date:</strong> ${escape(preferredDate)}</li>` : "",
    notes ? `<li><strong>Notes:</strong> ${escape(notes)}</li>` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const inner = `
    <p>Hi Moni,</p>
    <p>You have a new on-demand class request. Here are the details:</p>
    <ul style="padding-left:20px;margin:12px 0;">
      ${rows}
    </ul>
    <p>Log in to your admin panel to follow up.</p>
  `;
  await send(COACH_EMAIL, subject, wrapper(inner));
}

// ---------- Contact form — auto-reply to user ----------

export async function sendContactAutoReply(to: string, name: string): Promise<void> {
  const safeName = escape(name || "there");
  const subject = "We Got Your Message — Feel Better Club";
  const inner = `
    <p>Hi ${safeName},</p>
    <p>Thank you for reaching out! We've received your message and Moni will get back to you as soon as possible.</p>
    <p>In the meantime, feel free to check out our classes and upcoming sessions at <a href="https://thefeelbetterclub.com/book" style="color:#0d5e42;text-decoration:underline;">thefeelbetterclub.com</a>.</p>
    <p style="margin-top:32px;">See you outside!<br/><strong>Moni</strong><br/><em>Feel Better Coach &amp; Founder</em></p>
  `;
  await send(to, subject, wrapper(inner));
}
