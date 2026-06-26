import { logger } from '../configs/logger.config.js';
import { transporter } from '../configs/mail.config.js';

type SendMailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};
const sendEmail = async (data: SendMailInput) => {
  try {
    const mailOptions = {
      from: `"PhotoDey" <${process.env.GMAIL_USER}>`,
      to: data.to,
      subject: data.subject,
      text: data.text,
      html: data.html,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info('Email sent successfully', {
      to: data.to,
      subject: data.subject,
      messageId: info.messageId,
    });
    return info;
  } catch (error) {
    if (error instanceof Error) {
      logger.error('Failed to send email', {
        error: error.message,
        stack: error.stack,
        to: data.to,
        subject: data.subject,
      });
    } else {
      logger.error('Failed to send email', {
        error,
      });
    }
    throw error;
  }
};

export { sendEmail };
