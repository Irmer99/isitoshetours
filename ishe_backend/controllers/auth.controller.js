const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email });
  if (!admin || !(await admin.comparePassword(password))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { id: admin._id, email: admin.email, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
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
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({ token: newToken, admin });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

exports.seed = async (req, res) => {
  const existing = await Admin.findOne({ email: 'admin@ishetours.com' });
  if (existing) return res.json({ message: 'Admin already exists' });

  await Admin.create({
    email: 'admin@ishetours.com',
    password: 'admin123',
    role: 'superadmin',
  });

  res.json({ message: 'Admin seeded: admin@ishetours.com / admin123' });
};
