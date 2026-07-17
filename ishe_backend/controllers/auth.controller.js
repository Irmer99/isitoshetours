const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Admin = require('../models/Admin');
const PasswordReset = require('../models/PasswordReset');
const { sendMail } = require('../lib/mailer');
const logger = require('../lib/logger');

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email });
  if (!admin || !(await admin.comparePassword(password))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { id: admin._id, email: admin.email, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '14d' }
  );

  res.json({ token, admin });
};

exports.refresh = async (req, res) => {
  const { token } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);
    if (!admin) return res.status(401).json({ error: 'Admin not found' });

    const newToken = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '14d' }
    );

    res.json({ token: newToken, admin });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  logger.info({ email }, '[forgotPassword] Request received');
  const admin = await Admin.findOne({ email: email.toLowerCase() });

  if (!admin) {
    logger.info({ email }, '[forgotPassword] No admin found');
    return res.json({ message: 'If an account exists, a reset email has been sent' });
  }

  logger.info({ email: admin.email }, '[forgotPassword] Admin found');

  await PasswordReset.deleteMany({ email: admin.email });

  const { raw, hash } = PasswordReset.generateToken();
  await PasswordReset.create({
    email: admin.email,
    tokenHash: hash,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
  });

  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/reset-password?token=${raw}`;
  logger.info('[forgotPassword] Reset URL generated');

  try {
    const idempotencyKey = `reset-${admin.email}-${Date.now()}`;
    const result = await sendMail({
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
  const tokenHash = PasswordReset.hashToken(token);

  const record = await PasswordReset.findOne({
    tokenHash,
    expiresAt: { $gt: new Date() },
  });

  if (!record) {
    return res.status(400).json({ error: 'Invalid or expired reset token' });
  }

  const admin = await Admin.findOne({ email: record.email });
  if (!admin) {
    return res.status(400).json({ error: 'Invalid or expired reset token' });
  }

  admin.password = password;
  await admin.save();

  await PasswordReset.deleteMany({ email: record.email });

  res.json({ message: 'Password reset successful' });
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const admin = await Admin.findById(req.admin.id);

  if (!admin) {
    return res.status(404).json({ error: 'Admin not found' });
  }

  const valid = await admin.comparePassword(currentPassword);
  if (!valid) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }

  admin.password = newPassword;
  await admin.save();

  res.json({ message: 'Password changed successfully' });
};

module.exports = {
  login: exports.login,
  refresh: exports.refresh,
  forgotPassword: exports.forgotPassword,
  resetPassword: exports.resetPassword,
  changePassword: exports.changePassword,
};
