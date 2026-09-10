const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { getPrisma } = require('../lib/db');
const { sendMail } = require('../lib/mailer');
const logger = require('../lib/logger');

exports.login = async (req, res) => {
  if (req.body.website) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const email = String(req.body.email || '')
    .trim()
    .toLowerCase();
  const { password } = req.body;
  const prisma = getPrisma();

  let admin;
  try {
    admin = await prisma.admin.findUnique({ where: { email } });
  } catch (err) {
    logger.error({ err: err.message }, '[login] Database query failed');
    return res.status(503).json({ error: 'Service temporarily unavailable' });
  }

  if (!admin || !(await bcrypt.compare(password, admin.password))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { id: admin.id, email: admin.email, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '14d' },
  );

  const adminData = { ...admin };
  delete adminData.password;
  res.json({ token, admin: adminData });
};

exports.refresh = async (req, res) => {
  const { token } = req.body;
  const prisma = getPrisma();
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await prisma.admin.findUnique({ where: { id: decoded.id } });
    if (!admin) return res.status(401).json({ error: 'Admin not found' });

    const newToken = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '14d' },
    );

    const adminData = { ...admin };
    delete adminData.password;
    res.json({ token: newToken, admin: adminData });
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const prisma = getPrisma();
  logger.info({ email }, '[forgotPassword] Request received');
  const admin = await prisma.admin.findFirst({ where: { email: email.toLowerCase() } });

  if (!admin) {
    logger.info({ email }, '[forgotPassword] No admin found');
    return res.json({ message: 'If an account exists, a reset email has been sent' });
  }

  logger.info({ email: admin.email }, '[forgotPassword] Admin found');

  await prisma.passwordReset.deleteMany({ where: { email: admin.email } });

  const raw = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(raw).digest('hex');
  await prisma.passwordReset.create({
    data: {
      email: admin.email,
      tokenHash,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    },
  });

  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/reset-password?token=${raw}`;
  logger.info('[forgotPassword] Reset URL generated');

  try {
    const idempotencyKey = `reset-${admin.email}-${Date.now()}`;
    await sendMail({
      to: admin.email,
      subject: 'Password Reset — Isitoshe Tours',
      html: `
        <p>You requested a password reset for your Isitoshe Tours admin account.</p>
        <p>Click the link below to reset your password. This link expires in 15 minutes.</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `,
      idempotencyKey,
    });
    logger.info('[forgotPassword] Email sent successfully');
  } catch (err) {
    logger.error({ err: err.message }, '[forgotPassword] Failed to send email');
  }

  res.json({ message: 'If an account exists, a reset email has been sent' });
};

exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;
  const prisma = getPrisma();
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const record = await prisma.passwordReset.findFirst({
    where: {
      tokenHash,
      expiresAt: { gt: new Date() },
    },
  });

  if (!record) {
    return res.status(400).json({ error: 'Invalid or expired reset token' });
  }

  const admin = await prisma.admin.findFirst({ where: { email: record.email } });
  if (!admin) {
    return res.status(400).json({ error: 'Invalid or expired reset token' });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  await prisma.admin.update({
    where: { id: admin.id },
    data: { password: hashedPassword },
  });

  await prisma.passwordReset.deleteMany({ where: { email: record.email } });

  res.json({ message: 'Password reset successful' });
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const prisma = getPrisma();
  const admin = await prisma.admin.findUnique({ where: { id: req.admin.id } });

  if (!admin) {
    return res.status(404).json({ error: 'Admin not found' });
  }

  const valid = await bcrypt.compare(currentPassword, admin.password);
  if (!valid) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await prisma.admin.update({
    where: { id: admin.id },
    data: { password: hashedPassword },
  });

  res.json({ message: 'Password changed successfully' });
};

module.exports = {
  login: exports.login,
  refresh: exports.refresh,
  forgotPassword: exports.forgotPassword,
  resetPassword: exports.resetPassword,
  changePassword: exports.changePassword,
};
