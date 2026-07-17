const { Resend } = require('resend');

let resend;

const getClient = () => {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
};

const sendMail = async ({ to, subject, html }) => {
  const client = getClient();
  if (!client) {
    console.error('RESEND_API_KEY not set — email not sent');
    return null;
  }
  return client.emails.send({
    from: process.env.SMTP_FROM || 'Isitoshe Tours <onboarding@resend.dev>',
    to,
    subject,
    html,
  });
};

module.exports = { sendMail };
