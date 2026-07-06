const { z } = require('zod');

const createBookingSchema = z.object({
  client: z.string().length(24),
  itinerary: z.string().min(1),
  itineraryTitle: z.string().optional(),
  travelDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  participants: z.number().int().min(1),
  totalAmount: z.number().positive(),
  discountCode: z.string().optional(),
  discountApplied: z.number().min(0).optional(),
  notes: z.string().optional(),
});

const updateBookingStatusSchema = z.object({
  status: z.enum(['enquiry', 'confirmed', 'completed', 'cancelled']),
});

module.exports = { createBookingSchema, updateBookingStatusSchema };
