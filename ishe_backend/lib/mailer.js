const { Resend } = require('resend');
const logger = require('./logger');

let resend;

const getClient = () => {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
};

const sendMail = async ({ to, subject, html, idempotencyKey }) => {
  logger.info({ to, subject }, '[mailer] sendMail called');
  const client = getClient();
  if (!client) {
    logger.error('[mailer] RESEND_API_KEY not set — email not sent');
    return null;
  }
  logger.info('[mailer] Sending email via Resend...');
  const result = await client.emails.send(
    {
      from: process.env.SMTP_FROM || 'Isitoshe Tours <onboarding@resend.dev>',
      to,
      subject,
      html,
    },
    idempotencyKey ? { idempotencyKey } : undefined,
  );
  logger.info('[mailer] Email sent');
  return result;
};

module.exports = { sendMail };
