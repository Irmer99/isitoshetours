const { z } = require('zod');

const createBookingSchema = z.object({
  clientId: z.string().uuid(),
  itinerary: z.string().min(1),
  itineraryTitle: z.string().optional(),
  travelDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  participants: z.number().int().min(1),
  totalAmount: z.number().positive(),
  discountCode: z.string().optional(),
  notes: z.string().optional(),
});

const updateBookingStatusSchema = z.object({
  status: z.enum(['enquiry', 'confirmed', 'completed', 'cancelled']),
  comment: z.string().optional(),
});

const updateBookingEditSchema = z.object({
  itinerary: z.string().min(1).optional(),
  itineraryTitle: z.string().optional(),
  travelDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  participants: z.number().int().min(1).optional(),
  totalAmount: z.number().positive().optional(),
  notes: z.string().optional(),
});

module.exports = { createBookingSchema, updateBookingStatusSchema, updateBookingEditSchema };
