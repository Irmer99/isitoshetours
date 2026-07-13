import { z } from "zod";

export const itineraryDaySchema = z.object({
  day: z.number(),
  title: z.string().optional(),
  description: z.string().optional(),
  meals: z.array(z.string()).optional(),
  accommodation: z.string().optional(),
});

export const updateItinerarySchema = z.object({
  title: z.string().min(1).optional(),
  subtitle: z.string().optional(),
  difficulty: z.enum(["easy", "moderate", "hard"]).optional(),
  duration: z.string().optional(),
  pricing: z
    .object({
      from: z.number().optional(),
      currency: z.string().optional(),
    })
    .optional(),
  days: z.array(itineraryDaySchema).optional(),
  includes: z.array(z.string()).optional(),
  excludes: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
});

export type UpdateItineraryFormData = z.infer<typeof updateItinerarySchema>;
