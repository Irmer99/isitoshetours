const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

jest.mock('../lib/db', () => ({
  getPrisma: jest.fn(),
}));

jest.mock('../lib/mailer', () => ({
  sendMail: jest.fn(),
}));

const { getPrisma } = require('../lib/db');
const { login, resetPassword } = require('../controllers/auth.controller');

const mockRes = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
});

const mockAdmin = async (overrides = {}) => ({
  id: 'admin-1',
  email: 'admin@isitoshetours.com',
  role: 'superadmin',
  password: await bcrypt.hash('Str0ng!Pass', 12),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe('auth.controller — login', () => {
  const originalSecret = process.env.JWT_SECRET;
  const originalExpiry = process.env.JWT_EXPIRES_IN;

  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '14d';
  });

  afterAll(() => {
    if (originalSecret) process.env.JWT_SECRET = originalSecret;
    if (originalExpiry) process.env.JWT_EXPIRES_IN = originalExpiry;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 200 with a token and admin for valid credentials', async () => {
    const admin = await mockAdmin();
    getPrisma.mockReturnValue({
      admin: { findUnique: jest.fn().mockResolvedValue(admin) },
    });
    const req = { body: { email: 'admin@isitoshetours.com', password: 'Str0ng!Pass' } };
    const res = mockRes();

    await login(req, res);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledTimes(1);
    const payload = res.json.mock.calls[0][0];
    expect(payload.token).toBeTruthy();
    expect(payload.admin).toEqual({
      id: 'admin-1',
      email: 'admin@isitoshetours.com',
      role: 'superadmin',
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
    expect(payload.admin.password).toBeUndefined();

    const decoded = jwt.verify(payload.token, process.env.JWT_SECRET);
    expect(decoded.email).toBe('admin@isitoshetours.com');
  });

  it('normalizes email case and surrounding whitespace before lookup', async () => {
    const admin = await mockAdmin();
    const findUnique = jest.fn().mockResolvedValue(admin);
    getPrisma.mockReturnValue({ admin: { findUnique } });
    const req = {
      body: { email: '  ADMIN@IsitosheTours.COM  ', password: 'Str0ng!Pass' },
    };
    const res = mockRes();

    await login(req, res);

    expect(findUnique).toHaveBeenCalledWith({ where: { email: 'admin@isitoshetours.com' } });
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 401 for an incorrect password', async () => {
    const admin = await mockAdmin();
    getPrisma.mockReturnValue({
      admin: { findUnique: jest.fn().mockResolvedValue(admin) },
    });
    const req = { body: { email: 'admin@isitoshetours.com', password: 'WrongPass1!' } };
    const res = mockRes();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid email or password' });
  });

  it('returns 401 when no admin exists for the email', async () => {
    getPrisma.mockReturnValue({
      admin: { findUnique: jest.fn().mockResolvedValue(null) },
    });
    const req = { body: { email: 'nobody@isitoshetours.com', password: 'Str0ng!Pass' } };
    const res = mockRes();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid email or password' });
  });

  it('returns 401 for the website honeypot field', async () => {
    const req = {
      body: { email: 'admin@isitoshetours.com', password: 'Str0ng!Pass', website: 'spam' },
    };
    const res = mockRes();

    await login(req, res);

    expect(getPrisma).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 503 when the database query fails', async () => {
    getPrisma.mockReturnValue({
      admin: {
        findUnique: jest.fn().mockRejectedValue(new Error('Database unreachable')),
      },
    });
    const req = { body: { email: 'admin@isitoshetours.com', password: 'Str0ng!Pass' } };
    const res = mockRes();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({ error: 'Service temporarily unavailable' });
  });
});

describe('auth.controller — resetPassword', () => {
  const originalSecret = process.env.JWT_SECRET;
  const originalExpiry = process.env.JWT_EXPIRES_IN;

  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '14d';
  });

  afterAll(() => {
    if (originalSecret) process.env.JWT_SECRET = originalSecret;
    if (originalExpiry) process.env.JWT_EXPIRES_IN = originalExpiry;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates the password and returns a fresh auth token and admin', async () => {
    const admin = await mockAdmin();
    const update = jest.fn().mockResolvedValue({ ...admin, password: 'new-hash' });
    const deleteMany = jest.fn().mockResolvedValue({ count: 1 });
    getPrisma.mockReturnValue({
      passwordReset: {
        findFirst: jest.fn().mockResolvedValue({
          email: 'admin@isitoshetours.com',
          tokenHash: 'abc123',
          expiresAt: new Date(Date.now() + 60000),
        }),
        deleteMany,
      },
      admin: {
        findFirst: jest.fn().mockResolvedValue(admin),
        update,
      },
    });
    const req = { body: { token: 'raw-reset-token', password: 'NewStr0ng!Pass' } };
    const res = mockRes();

    await resetPassword(req, res);

    expect(update).toHaveBeenCalledTimes(1);
    const updateArg = update.mock.calls[0][0];
    expect(updateArg.where.id).toBe('admin-1');
    expect(updateArg.data.password).not.toBe('NewStr0ng!Pass');
    expect(await bcrypt.compare('NewStr0ng!Pass', updateArg.data.password)).toBe(true);
    expect(deleteMany).toHaveBeenCalledWith({ where: { email: 'admin@isitoshetours.com' } });
    expect(res.status).not.toHaveBeenCalled();
    const payload = res.json.mock.calls[0][0];
    expect(payload.token).toBeTruthy();
    expect(payload.admin.password).toBeUndefined();

    const decoded = jwt.verify(payload.token, process.env.JWT_SECRET);
    expect(decoded.email).toBe('admin@isitoshetours.com');
  });

  it('returns 400 for an expired or unknown reset token', async () => {
    getPrisma.mockReturnValue({
      passwordReset: {
        findFirst: jest.fn().mockResolvedValue(null),
        deleteMany: jest.fn(),
      },
      admin: { findFirst: jest.fn(), update: jest.fn() },
    });
    const req = { body: { token: 'bad-token', password: 'NewStr0ng!Pass' } };
    const res = mockRes();

    await resetPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired reset token' });
  });
});
