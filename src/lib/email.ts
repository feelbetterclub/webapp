import { Resend } from "resend";
import { getEmailStrings } from "./email-i18n";

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
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf8f2;padding:24px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
        <tr><td style="background:#0d5e42;padding:24px;text-align:center;">
          <img src="https://thefeelbetterclub.com/logo-v4-white-hd.png" alt="Feel Better Club" height="40" style="height:40px;width:auto;" />
        </td></tr>
        <tr><td style="padding:28px 24px;line-height:1.6;font-size:15px;color:#062e21;">
          ${inner}
        </td></tr>
        <tr><td style="padding:16px 24px;background:#0d5e42;text-align:center;font-size:12px;color:#ffffff;">
          Sport · Nature · Connection
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

// ---------- Welcome email (community signup) ----------

export async function sendWelcomeEmail(to: string, name: string, lang?: string): Promise<void> {
  const s = getEmailStrings(lang).welcome;
  const safeName = escape(name || "there");
  const inner = `
    <p>${s.greeting(safeName)}</p>
    <p>${s.p1}</p>
    <p>${s.p2}</p>
    <p>${s.p3}</p>
    <p>${s.p4}</p>
    <p>${s.p5}</p>
    <p style="margin-top:32px;">${s.signoff}<br/><strong>Moni</strong><br/><em>${s.role}</em></p>
  `;
  await send(to, s.subject, wrapper(inner));
}

// ---------- Waitlist confirmation email ----------

export interface WaitlistConfirmationData {
  to: string;
  userName: string;
  date: string;
  time: string;
  classType: string;
  position: number;
  lang?: string;
}

export async function sendWaitlistConfirmation(data: WaitlistConfirmationData): Promise<void> {
  const { to, userName, date, time, classType, lang } = data;
  const s = getEmailStrings(lang).waitlist;
  const safeName = escape(userName || "there");
  const safeClass = escape(classType);
  const safeDate = escape(date);
  const safeTime = escape(time);

  const inner = `
    <p>${s.greeting(safeName)}</p>
    <p>${s.intro}</p>
    <p><strong>${s.detailsLabel}</strong></p>
    <ul style="padding-left:20px;margin:12px 0;">
      <li><strong>${s.classLabel}</strong> ${safeClass}</li>
      <li><strong>${s.dateLabel}</strong> ${safeDate}</li>
      <li><strong>${s.timeLabel}</strong> ${safeTime}</li>
      <li><strong>${s.statusLabel}</strong> ${s.statusValue}</li>
    </ul>
    <p>${s.body}</p>
    <p style="margin-top:32px;">${s.signoff}<br/><strong>Moni</strong></p>
  `;
  await send(to, s.subject, wrapper(inner));
}

// ---------- Booking confirmation email ----------

export interface BookingConfirmationData {
  to: string;
  userName: string;
  date: string; // ISO date e.g. 2026-04-20
  time: string; // "09:00"
  classType: string;
  cancelUrl?: string;
  lang?: string;
}

export async function sendBookingConfirmation(data: BookingConfirmationData): Promise<void> {
  const { to, userName, date, time, classType, cancelUrl, lang } = data;
  const s = getEmailStrings(lang).booking;
  const safeName = escape(userName || "there");
  const safeClass = escape(classType);
  const safeDate = escape(date);
  const safeTime = escape(time);

  const cancelBlock = cancelUrl
    ? `<p>${s.cancelIntro}</p>
       <p><a href="${cancelUrl}" style="color:#0d5e42;text-decoration:underline;">${escape(cancelUrl)}</a></p>`
    : "";

  const inner = `
    <p>${s.greeting(safeName)}</p>
    <p>${s.intro}</p>
    <p><strong>${s.detailsLabel}</strong></p>
    <ul style="padding-left:20px;margin:12px 0;">
      <li><strong>${s.dateLabel}</strong> ${safeDate}</li>
      <li><strong>${s.timeLabel}</strong> ${safeTime}</li>
      <li><strong>${s.classLabel}</strong> ${safeClass}</li>
    </ul>
    ${cancelBlock}
    <p style="margin-top:32px;">${s.signoff}<br/><strong>Moni</strong></p>
  `;
  await send(to, s.subject, wrapper(inner));
}

// ---------- Contact form notification (to coach) — always English ----------

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

// ---------- Anonymous message notification (to coach) — always English ----------

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
  lang?: string;
}

export async function sendOnDemandConfirmation(data: OnDemandConfirmationData): Promise<void> {
  const { to, userName, groupSize, preferredDate, lang } = data;
  const s = getEmailStrings(lang).onDemandConfirmation;
  const safeName = escape(userName || "there");

  const detailRows = [
    groupSize ? `<li><strong>${s.groupSizeLabel}</strong> ${escape(groupSize)}</li>` : "",
    preferredDate ? `<li><strong>${s.preferredDateLabel}</strong> ${escape(preferredDate)}</li>` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const detailBlock = detailRows
    ? `<p><strong>${s.detailsLabel}</strong></p>
       <ul style="padding-left:20px;margin:12px 0;">
         ${detailRows}
       </ul>`
    : "";

  const inner = `
    <p>${s.greeting(safeName)}</p>
    <p>${s.intro}</p>
    ${detailBlock}
    <p>${s.followUp}</p>
    <p>${s.meanwhile}</p>
    <p style="margin-top:32px;">${s.signoff}<br/><strong>Moni</strong><br/><em>${s.role}</em></p>
  `;
  await send(to, s.subject, wrapper(inner));
}

// ---------- On-demand class request — coach lead notification (FBC-71) — always English ----------

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

export async function sendContactAutoReply(to: string, name: string, lang?: string): Promise<void> {
  const s = getEmailStrings(lang).contactAutoReply;
  const safeName = escape(name || "there");
  const inner = `
    <p>${s.greeting(safeName)}</p>
    <p>${s.body}</p>
    <p>${s.cta} <a href="https://thefeelbetterclub.com/book" style="color:#0d5e42;text-decoration:underline;">${s.ctaLabel}</a>.</p>
    <p style="margin-top:32px;">${s.signoff}<br/><strong>Moni</strong><br/><em>${s.role}</em></p>
  `;
  await send(to, s.subject, wrapper(inner));
}
