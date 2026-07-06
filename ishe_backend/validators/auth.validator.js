const { z } = require('zod');

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const refreshSchema = z.object({
  token: z.string().min(1),
});

module.exports = { loginSchema, refreshSchema };
