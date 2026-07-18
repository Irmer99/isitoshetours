const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

resend.emails.send({
  from: 'onboarding@resend.dev',
  to: process.env.ADMIN_EMAIL || 'your-email@example.com',
  subject: 'Hello World',
  html: '<p>Congrats on sending your <strong>first email</strong>!</p>'
}).then((res) => {
  console.log('Email sent:', res);
}).catch((err) => {
  console.error('Error:', err);
});
