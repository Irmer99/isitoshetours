const { Resend } = require('resend');

let resend;

const getClient = () => {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
};

const sendMail = async ({ to, subject, html }) => {
  console.log('[mailer] sendMail called:', { to, subject });
  const client = getClient();
  if (!client) {
    console.error('[mailer] RESEND_API_KEY not set — email not sent');
    return null;
  }
  console.log('[mailer] Sending email via Resend...');
  const result = await client.emails.send({
    from: process.env.SMTP_FROM || 'Isitoshe Tours <onboarding@resend.dev>',
    to,
    subject,
    html,
  });
  console.log('[mailer] Email sent:', result);
  return result;
};

module.exports = { sendMail };
