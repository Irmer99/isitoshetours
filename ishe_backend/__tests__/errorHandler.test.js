const errorHandler = require('../middleware/errorHandler');

const mockReq = { url: '/test', method: 'GET' };
const mockRes = () => {
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  return res;
};
const mockNext = jest.fn();

describe('Error Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle Prisma P2002 (unique constraint) as 409', () => {
    const err = {
      code: 'P2002',
      meta: { target: ['email'] },
      message: 'Unique constraint failed',
    };
    const res = mockRes();
    errorHandler(err, mockReq, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: 'Duplicate value for email' });
  });

  it('should handle Prisma P2025 (record not found) as 404', () => {
    const err = {
      code: 'P2025',
      message: 'Record not found',
    };
    const res = mockRes();
    errorHandler(err, mockReq, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Record not found' });
  });

  it('should handle Prisma P2003 (foreign key) as 400', () => {
    const err = {
      code: 'P2003',
      message: 'Foreign key constraint failed',
    };
    const res = mockRes();
    errorHandler(err, mockReq, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Related record not found' });
  });

  it('should handle ZodError as 400', () => {
    const err = {
      name: 'ZodError',
      message: 'Validation failed',
    };
    const res = mockRes();
    errorHandler(err, mockReq, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Validation error', details: 'Validation failed' });
  });

  it('should return 500 for unknown errors', () => {
    const err = {
      message: 'Something went wrong',
    };
    const res = mockRes();
    errorHandler(err, mockReq, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Something went wrong' });
  });

  it('should hide error details in production for 500 errors', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    
    const err = {
      message: 'Internal database error',
    };
    const res = mockRes();
    errorHandler(err, mockReq, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    
    process.env.NODE_ENV = originalEnv;
  });
});
