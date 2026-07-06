const { z } = require('zod');

const updateItinerarySchema = z.object({
  title: z.string().min(1).optional(),
  subtitle: z.string().optional(),
  difficulty: z.enum(['easy', 'moderate', 'hard']).optional(),
  duration: z.string().optional(),
  pricing: z.object({
    from: z.number().optional(),
    currency: z.string().optional(),
  }).optional(),
  days: z.array(z.object({
    day: z.number(),
    title: z.string().optional(),
    description: z.string().optional(),
    meals: z.array(z.string()).optional(),
    accommodation: z.string().optional(),
  })).optional(),
  includes: z.array(z.string()).optional(),
  excludes: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
});

const updateDestinationSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  images: z.array(z.string()).optional(),
  highlights: z.array(z.string()).optional(),
});

const updateTestimonialSchema = z.object({
  name: z.string().min(1).optional(),
  text: z.string().min(1).optional(),
  rating: z.number().min(1).max(5).optional(),
  avatar: z.string().optional(),
  active: z.boolean().optional(),
  order: z.number().int().optional(),
});

const updateTeamSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.string().min(1).optional(),
  bio: z.string().optional(),
  photo: z.string().optional(),
  order: z.number().int().optional(),
  active: z.boolean().optional(),
});

const updateSiteSettingsSchema = z.object({
  data: z.record(z.any()),
});

module.exports = {
  updateItinerarySchema,
  updateDestinationSchema,
  updateTestimonialSchema,
  updateTeamSchema,
  updateSiteSettingsSchema,
};
