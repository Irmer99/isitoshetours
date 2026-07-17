const { z } = require('zod');

const createClientSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().min(1).max(30),
  notes: z.string().optional(),
  website: z.string().max(0).optional().refine((v) => !v, { message: 'Invalid field' }),
});

const updateClientSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(1).max(30).optional(),
  notes: z.string().optional(),
});

module.exports = { createClientSchema, updateClientSchema };
