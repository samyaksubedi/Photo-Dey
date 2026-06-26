import { envVariables } from '../../configs/env.config.js';
import { sendEmail } from '../../utils/email.util.js';

type GetEmailShellInput = {
  name: string;
  verificationUrl: string;
  headline: string;
  introParagraph: string;
};

const getEmailShell = (data: GetEmailShellInput) => ({
  html: `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0"
    />
    <title>PhotoDey</title>

    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: 'Segoe UI', Arial, sans-serif;
        background-color: #f8fafc;
        color: #0f172a;
      }

      .wrapper {
        max-width: 580px;
        margin: 40px auto;
        background: #ffffff;
        border-radius: 18px;
        overflow: hidden;
        border: 1px solid #e2e8f0;
      }

      .header {
        background: #0f172a;
        padding: 36px 40px;
        display: flex;
        align-items: center;
        gap: 14px;
      }

      .header-logo {
        width: 44px;
        height: 44px;
        background: #2563eb;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
      }

      .header h1 {
        color: #ffffff;
        font-size: 24px;
        font-weight: 700;
      }

      .header p {
        color: #cbd5e1;
        font-size: 13px;
        margin-top: 2px;
      }

      .body {
        padding: 40px;
      }

      .body h2 {
        font-size: 22px;
        color: #0f172a;
        margin-bottom: 14px;
      }

      .body p {
        font-size: 15px;
        line-height: 1.8;
        color: #475569;
        margin-bottom: 16px;
      }

      .feature-box {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 18px;
        margin: 24px 0;
      }

      .feature-box ul {
        margin: 0;
        padding-left: 18px;
      }

      .feature-box li {
        color: #475569;
        margin-bottom: 8px;
        font-size: 14px;
      }

      .verify-box {
        background: #eff6ff;
        border: 1px solid #bfdbfe;
        border-radius: 14px;
        padding: 28px;
        text-align: center;
        margin: 28px 0;
      }

      .verify-box p {
        color: #334155;
        margin-bottom: 20px;
      }

      .cta-btn {
        display: inline-block;
        padding: 14px 36px;
        background: #2563eb;
        color: #ffffff !important;
        text-decoration: none;
        border-radius: 10px;
        font-size: 15px;
        font-weight: 600;
      }

      .fallback {
        margin-top: 18px;
        font-size: 12px;
        color: #64748b;
      }

      .fallback a {
        color: #2563eb;
        word-break: break-all;
        text-decoration: none;
      }

      .divider {
        border: none;
        border-top: 1px solid #e2e8f0;
        margin: 28px 0;
      }

      .notice {
        font-size: 13px;
        color: #64748b;
        line-height: 1.7;
      }

      .notice a {
        color: #2563eb;
        text-decoration: none;
      }

      .footer {
        background: #f8fafc;
        padding: 20px 40px;
        border-top: 1px solid #e2e8f0;
      }

      .footer p {
        font-size: 12px;
        color: #94a3b8;
        text-align: center;
        line-height: 1.8;
      }

      .footer a {
        color: #2563eb;
        text-decoration: none;
      }
    </style>
  </head>

  <body>
    <div class="wrapper">
      <div class="header">
        <div class="header-logo">📸</div>

        <div>
          <h1>PhotoDey</h1>
          <p>Find your moments.</p>
        </div>
      </div>

      <div class="body">
        <h2>${data.headline}</h2>

        <p>${data.introParagraph}</p>

        <div class="feature-box">
          <ul>
            <li>Upload a selfie and find your photos instantly.</li>
            <li>Access photos from supported events.</li>
            <li>Download and share your favorite memories.</li>
          </ul>
        </div>

        <div class="verify-box">
          <p>
            Verify your email to activate your account and start accessing
            your event galleries.
          </p>

          <a
            href="${data.verificationUrl}"
            class="cta-btn"
          >
            Verify Email
          </a>

          <div class="fallback">
            Button not working? Copy and paste this link:
            <br /><br />

            <a href="${data.verificationUrl}">
              ${data.verificationUrl}
            </a>
          </div>
        </div>

        <hr class="divider" />

        <p class="notice">
          Didn't create a PhotoDey account? You can safely ignore this email.
          <br />
          Questions? Contact us at
          <a href="mailto:${envVariables.GMAIL_USER}">
            ${envVariables.GMAIL_USER}
          </a>
        </p>

        <p
          class="notice"
          style="margin-top: 12px;"
        >
          The PhotoDey Team
        </p>
      </div>

      <div class="footer">
        <p>
          You're receiving this email because a PhotoDey account was created
          using this email address.
          <br />

          <a href="${envVariables.CLIENT_URL}/privacy">
            Privacy Policy
          </a>

          &nbsp;·&nbsp;

          <a href="${envVariables.CLIENT_URL}">
            PhotoDey
          </a>
        </p>
      </div>
    </div>
  </body>
</html>
`,

  text: `
Hi ${data.name},

Welcome to PhotoDey.

Verify your account here:

${data.verificationUrl}

PhotoDey helps you:

• Upload a selfie and find your photos instantly
• Access event galleries
• Download and share your memories

This verification link expires in 24 hours.

If you didn't create a PhotoDey account, you can safely ignore this email.

— The PhotoDey Team
`,
});

type SendWelcomeEmailInput = {
  to: string;
  name: string;
  emailVerificationToken: string;
};

const sendWelcomeEmail = async (data: SendWelcomeEmailInput) => {
  const verificationUrl = `${envVariables.CLIENT_URL}/auth/verify/${data.emailVerificationToken}`;

  const { html, text } = getEmailShell({
    name: data.name,
    verificationUrl,
    headline: `Welcome to PhotoDey, ${data.name}! 📸`,
    introParagraph:
      'Thanks for joining PhotoDey. Verify your email address to activate your account and start finding your photos from events in seconds.',
  });

  return sendEmail({
    to: data.to,
    subject: 'Welcome to PhotoDey — Verify Your Email',
    html,
    text,
  });
};

type ResendVerificationEmailInput = SendWelcomeEmailInput;

const resendVerificationEmail = async (data: ResendVerificationEmailInput) => {
  const verificationUrl = `${envVariables.CLIENT_URL}/auth/verify/${data.emailVerificationToken}`;

  const { html, text } = getEmailShell({
    name: data.name,
    verificationUrl,
    headline: 'Your new verification link is ready',
    introParagraph:
      'We received a request for a new verification email. Use the link below to activate your PhotoDey account and continue finding your event photos.',
  });

  return sendEmail({
    to: data.to,
    subject: 'PhotoDey — New Verification Email',
    html,
    text,
  });
};

export { sendWelcomeEmail, resendVerificationEmail };
