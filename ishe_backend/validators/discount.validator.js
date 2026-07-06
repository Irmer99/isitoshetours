const { z } = require('zod');

const createDiscountSchema = z.object({
  code: z.string().min(1).max(50),
  type: z.enum(['percent', 'flat']),
  value: z.number().positive(),
  appliesTo: z.string().min(1),
  startDate: z.string().datetime({ offset: true }).or(z.string()),
  endDate: z.string().datetime({ offset: true }).or(z.string()),
  usageLimit: z.number().int().positive().optional(),
});

const updateDiscountSchema = z.object({
  code: z.string().min(1).max(50).optional(),
  type: z.enum(['percent', 'flat']).optional(),
  value: z.number().positive().optional(),
  appliesTo: z.string().min(1).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  usageLimit: z.number().int().positive().optional().nullable(),
  active: z.boolean().optional(),
});

const validateDiscountSchema = z.object({
  code: z.string().min(1),
  itineraryId: z.string().min(1),
});

module.exports = { createDiscountSchema, updateDiscountSchema, validateDiscountSchema };
