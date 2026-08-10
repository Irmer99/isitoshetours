const validateBody = require('../middleware/validateBody');
const { loginSchema } = require('../validators/auth.validator');

describe('validateBody middleware', () => {
  const mockRes = () => ({ status: jest.fn().mockReturnThis(), json: jest.fn() });
  const mockNext = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls next() with parsed data on a valid body', () => {
    const req = { body: { email: 'admin@isitoshetours.com', password: 'Str0ng!Pass' } };
    validateBody(loginSchema)(req, mockRes(), mockNext);
    expect(mockNext).toHaveBeenCalled();
    expect(req.body.email).toBe('admin@isitoshetours.com');
    expect(req.body.password).toBe('Str0ng!Pass');
  });

  it('responds 400 with field errors on an invalid body and does not call next()', () => {
    const req = { body: { email: 'not-an-email', password: 'short' } };
    const res = mockRes();
    validateBody(loginSchema)(req, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Validation failed' }));
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('strips unknown fields that are not declared in the schema', () => {
    const req = { body: { email: 'admin@isitoshetours.com', password: 'Str0ng!Pass', foo: 'bar' } };
    validateBody(loginSchema)(req, mockRes(), mockNext);
    expect(req.body).not.toHaveProperty('foo');
    expect(mockNext).toHaveBeenCalled();
  });
});
