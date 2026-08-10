const { z } = require('zod');

const urlSchema = z.string().url('Must be a valid URL');
const optionalImageUrls = z.array(urlSchema).optional();
const imageUrl = z.string().url('Must be a valid URL').optional();

const createItinerarySchema = z.object({
  title: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with dashes'),
  subtitle: z.string().optional(),
  difficulty: z.enum(['easy', 'moderate', 'hard']).default('moderate'),
  duration: z.string().optional(),
  pricing: z
    .object({
      from: z.number().optional(),
      currency: z.string().optional(),
    })
    .optional(),
  days: z
    .array(
      z.object({
        day: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        meals: z.array(z.string()).optional(),
        accommodation: z.string().optional(),
      }),
    )
    .optional(),
  includes: z.array(z.string()).optional(),
  excludes: z.array(z.string()).optional(),
  images: optionalImageUrls,
  destinations: z.array(z.string()).optional(),
});

const updateItinerarySchema = z.object({
  title: z.string().min(1).optional(),
  subtitle: z.string().optional(),
  difficulty: z.enum(['easy', 'moderate', 'hard']).optional(),
  duration: z.string().optional(),
  pricing: z
    .object({
      from: z.number().optional(),
      currency: z.string().optional(),
    })
    .optional(),
  days: z
    .array(
      z.object({
        day: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        meals: z.array(z.string()).optional(),
        accommodation: z.string().optional(),
      }),
    )
    .optional(),
  includes: z.array(z.string()).optional(),
  excludes: z.array(z.string()).optional(),
  images: optionalImageUrls,
  destinations: z.array(z.string()).optional(),
});

const createDestinationSchema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with dashes'),
  name: z.string().min(1),
  description: z.string().optional(),
  images: optionalImageUrls,
  highlights: z.array(z.string()).optional(),
});

const updateDestinationSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  images: optionalImageUrls,
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

const homepageDataSchema = z
  .object({
    heroSlides: z
      .array(
        z.object({
          image: z.string().url('Must be a valid URL'),
          tagline: z.string().min(1),
        }),
      )
      .max(15)
      .optional(),
    aboutTitle: z.string().optional(),
    aboutParagraphs: z.array(z.string()).optional(),
    aboutImages: z.array(z.string().url('Must be a valid URL')).optional(),
  })
  .passthrough();

const updateSiteSettingsSchema = z.object({
  data: z.record(z.string(), z.unknown()).and(homepageDataSchema),
});

const createBlogSchema = z.object({
  title: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with dashes'),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  coverImage: imageUrl,
  images: optionalImageUrls,
  tags: z.array(z.string()).optional(),
});

const updateBlogSchema = z.object({
  title: z.string().min(1).optional(),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  coverImage: imageUrl,
  images: optionalImageUrls,
  tags: z.array(z.string()).optional(),
  archived: z.boolean().optional(),
});

module.exports = {
  createItinerarySchema,
  updateItinerarySchema,
  createDestinationSchema,
  updateDestinationSchema,
  updateTestimonialSchema,
  updateTeamSchema,
  updateSiteSettingsSchema,
  createBlogSchema,
  updateBlogSchema,
};
