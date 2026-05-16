// Resend integration via fetch (no SDK).
// Lazy env getters — never throw at module load time so `next build` can
// collect page data without RESEND_API_KEY being set.

function getResendKey(): string | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return key;
}

function getFromAddress(): string {
  return process.env.FROM_EMAIL || 'Rukhsati <onboarding@resend.dev>';
}

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

/**
 * Fire-and-forget friendly email sender. Returns true on success, false on
 * any failure (including missing API key). Never throws.
 */
export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<boolean> {
  const key = getResendKey();
  if (!key) {
    console.warn('[email] RESEND_API_KEY not set — skipping email to', to);
    return false;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: getFromAddress(),
        to,
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error('[email] Resend API error:', res.status, text);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[email] Send failed:', err);
    return false;
  }
}

// ── Branding helpers ──────────────────────────────────────────────
const MAROON = '#800020';
const GOLD = '#d4a853';

function shell(bodyHtml: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;color:#333;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
            <tr>
              <td style="background:linear-gradient(135deg, ${MAROON} 0%, ${GOLD} 100%);padding:24px 32px;">
                <h1 style="margin:0;color:#ffffff;font-size:24px;letter-spacing:0.5px;">Rukhsati</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;font-size:15px;line-height:1.6;color:#333;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px;background:#fafafa;border-top:1px solid #eee;font-size:12px;color:#888;text-align:center;">
                &copy; ${new Date().getFullYear()} Rukhsati · Pakistan's wedding marketplace
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:${MAROON};color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;">${label}</a>`;
}

// ── Template registry ────────────────────────────────────────────
export const emailTemplates = {
  welcome(name: string) {
    return {
      subject: 'Welcome to Rukhsati!',
      html: shell(`
        <h2 style="color:${MAROON};margin-top:0;">Welcome, ${name}!</h2>
        <p>We're thrilled to have you join Pakistan's premier wedding marketplace.</p>
        <p>Browse beautiful bridal wear, decor, jewellery and connect with trusted sellers across the country.</p>
        <p style="margin-top:24px;">${button('https://rukhsati.pk', 'Start Exploring')}</p>
        <p style="color:#888;margin-top:24px;font-size:13px;">Mubarak ho — your wedding journey begins here.</p>
      `),
    };
  },

  verifyEmail(name: string, link: string) {
    return {
      subject: 'Verify your email — Rukhsati',
      html: shell(`
        <h2 style="color:${MAROON};margin-top:0;">Hi ${name},</h2>
        <p>Please confirm your email address so we can secure your account.</p>
        <p style="margin:24px 0;">${button(link, 'Verify Email')}</p>
        <p style="font-size:13px;color:#888;">Or copy this link: <br/><span style="word-break:break-all;">${link}</span></p>
        <p style="font-size:13px;color:#888;">This link expires in 24 hours.</p>
      `),
    };
  },

  passwordReset(name: string, link: string) {
    return {
      subject: 'Reset your password — Rukhsati',
      html: shell(`
        <h2 style="color:${MAROON};margin-top:0;">Hi ${name},</h2>
        <p>We received a request to reset your Rukhsati password. Click below to choose a new one.</p>
        <p style="margin:24px 0;">${button(link, 'Reset Password')}</p>
        <p style="font-size:13px;color:#888;">Or copy this link: <br/><span style="word-break:break-all;">${link}</span></p>
        <p style="font-size:13px;color:#888;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
      `),
    };
  },

  newMessage(
    receiverName: string,
    senderName: string,
    listingTitle: string | null,
    msg: string,
    chatLink: string
  ) {
    const context = listingTitle
      ? `about your listing <strong>${listingTitle}</strong>`
      : '';
    const preview = msg.length > 200 ? msg.slice(0, 200) + '…' : msg;
    return {
      subject: `New message from ${senderName} on Rukhsati`,
      html: shell(`
        <h2 style="color:${MAROON};margin-top:0;">Hi ${receiverName},</h2>
        <p><strong>${senderName}</strong> sent you a message ${context}.</p>
        <blockquote style="border-left:3px solid ${GOLD};margin:16px 0;padding:8px 16px;background:#fafafa;color:#555;">
          ${preview}
        </blockquote>
        <p style="margin:24px 0;">${button(chatLink, 'Open Chat')}</p>
      `),
    };
  },

  orderPlaced(buyerName: string, listingTitle: string, orderId: string) {
    return {
      subject: 'Order confirmed — Rukhsati',
      html: shell(`
        <h2 style="color:${MAROON};margin-top:0;">Thanks, ${buyerName}!</h2>
        <p>Your order for <strong>${listingTitle}</strong> has been placed.</p>
        <p>Order ID: <code style="background:#f5f5f5;padding:2px 6px;border-radius:4px;">${orderId}</code></p>
        <p>We'll notify you when the seller confirms and ships your item. Payment is held in escrow until you receive your order.</p>
      `),
    };
  },

  orderNewForSeller(
    sellerName: string,
    buyerName: string,
    listingTitle: string,
    orderId: string
  ) {
    return {
      subject: 'You have a new order!',
      html: shell(`
        <h2 style="color:${MAROON};margin-top:0;">Mubarak, ${sellerName}!</h2>
        <p><strong>${buyerName}</strong> just placed an order for <strong>${listingTitle}</strong>.</p>
        <p>Order ID: <code style="background:#f5f5f5;padding:2px 6px;border-radius:4px;">${orderId}</code></p>
        <p>Please confirm and ship the item promptly. Payment is being held in escrow and will be released once delivery is confirmed.</p>
      `),
    };
  },
};
