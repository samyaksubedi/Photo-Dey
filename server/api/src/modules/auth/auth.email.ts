import { envVariables } from '../../configs/env.config.js';
import { sendEmail } from '../../utils/email.util.js';

const BRAND = {
  maroon: '#902338',
  marigold: '#EDA93E',
  cream: '#F6F3ED',
  ink: '#1B1A17',
  muted: '#5C574D',
  faint: '#6B665A',
  line: '#E3DCCD',
  soft: '#FBF9F4',
};

const FONT =
  "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

type EmailContent = {
  preheader: string;
  headline: string;
  paragraphs: string[];
  ctaLabel: string;
  ctaUrl: string;
  fallbackLabel: string;
  note: string;
};

const renderEmail = (content: EmailContent) => {
  const logoUrl = `${envVariables.CLIENT_URL}/email-logo.png`;
  const supportEmail = envVariables.GMAIL_USER;
  const url = escapeHtml(content.ctaUrl);

  const paragraphs = content.paragraphs
    .map(
      (text) =>
        `<p style="margin:0 0 16px;font-family:${FONT};font-size:16px;line-height:1.65;color:${BRAND.muted};">${escapeHtml(text)}</p>`,
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta name="color-scheme" content="light" />
    <title>PhotoDey</title>
  </head>
  <body style="margin:0;padding:0;background:${BRAND.cream};">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(content.preheader)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.cream};">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;background:#ffffff;border:1px solid ${BRAND.line};border-radius:20px;overflow:hidden;">
            <tr>
              <td style="padding:22px 32px;border-bottom:4px solid ${BRAND.marigold};">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td><img src="${logoUrl}" width="44" height="44" alt="" style="display:block;border:0;width:44px;height:44px;" /></td>
                    <td style="padding-left:12px;font-family:${FONT};font-size:22px;font-weight:800;letter-spacing:-0.5px;color:${BRAND.ink};">PhotoDey</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:36px 32px 12px;">
                <h1 style="margin:0 0 16px;font-family:${FONT};font-size:28px;line-height:1.2;font-weight:800;color:${BRAND.ink};">${escapeHtml(content.headline)}</h1>
                ${paragraphs}
              </td>
            </tr>
            <tr>
              <td style="padding:8px 32px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="background:${BRAND.maroon};border-radius:999px;">
                      <a href="${url}" style="display:inline-block;padding:15px 32px;font-family:${FONT};font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:999px;">${escapeHtml(content.ctaLabel)}</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px 32px;">
                <p style="margin:0;font-family:${FONT};font-size:13px;line-height:1.6;color:${BRAND.faint};">${escapeHtml(content.fallbackLabel)}<br /><a href="${url}" style="color:${BRAND.maroon};word-break:break-all;">${url}</a></p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background:${BRAND.soft};border-top:1px solid ${BRAND.line};">
                <p style="margin:0;font-family:${FONT};font-size:13px;line-height:1.7;color:${BRAND.faint};">${escapeHtml(content.note)} Questions? Write to <a href="mailto:${escapeHtml(supportEmail)}" style="color:${BRAND.maroon};">${escapeHtml(supportEmail)}</a>.</p>
              </td>
            </tr>
          </table>
          <p style="margin:20px 0 0;font-family:${FONT};font-size:12px;line-height:1.7;color:${BRAND.faint};text-align:center;">
            PhotoDey, find every moment you were in.<br />
            <a href="${envVariables.CLIENT_URL}/privacy" style="color:${BRAND.faint};">Privacy</a> &nbsp;|&nbsp; <a href="${envVariables.CLIENT_URL}" style="color:${BRAND.faint};">photodey.com</a>
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = `${content.headline}

${content.paragraphs.join('\n\n')}

${content.ctaLabel}: ${content.ctaUrl}

${content.note}
Questions? Write to ${supportEmail}.

PhotoDey, find every moment you were in.`;

  return { html, text };
};

type SendWelcomeEmailInput = {
  to: string;
  name: string;
  emailVerificationToken: string;
};

const sendWelcomeEmail = async (data: SendWelcomeEmailInput) => {
  const verificationUrl = `${envVariables.CLIENT_URL}/auth/verify/${data.emailVerificationToken}`;

  const { html, text } = renderEmail({
    preheader: 'Confirm your email to start creating events.',
    headline: `Welcome to PhotoDey, ${data.name}`,
    paragraphs: [
      'Confirm your email address to activate your account.',
      'After that, upload your event photos once and share one QR code. Every guest can then find the photos they appear in.',
    ],
    ctaLabel: 'Verify email',
    ctaUrl: verificationUrl,
    fallbackLabel: 'Button not working? Paste this link into your browser:',
    note: "This link works for 24 hours. If you didn't create a PhotoDey account, you can ignore this email.",
  });

  return sendEmail({
    to: data.to,
    subject: 'Verify your email to start using PhotoDey',
    html,
    text,
  });
};

type ResendVerificationEmailInput = SendWelcomeEmailInput;

const resendVerificationEmail = async (data: ResendVerificationEmailInput) => {
  const verificationUrl = `${envVariables.CLIENT_URL}/auth/verify/${data.emailVerificationToken}`;

  const { html, text } = renderEmail({
    preheader: 'Your new verification link is ready.',
    headline: 'Here is your new verification link',
    paragraphs: [
      'You asked for a new link. Use it to activate your PhotoDey account and start creating events.',
    ],
    ctaLabel: 'Verify email',
    ctaUrl: verificationUrl,
    fallbackLabel: 'Button not working? Paste this link into your browser:',
    note: "This link works for 24 hours and replaces any earlier link. If you didn't ask for it, you can ignore this email.",
  });

  return sendEmail({
    to: data.to,
    subject: 'Your new PhotoDey verification link',
    html,
    text,
  });
};

export { sendWelcomeEmail, resendVerificationEmail, renderEmail };
