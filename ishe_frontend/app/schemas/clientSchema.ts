import { z } from "zod";

export const createClientSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Valid email required"),
  phone: z.string().min(1, "Phone is required").max(30),
  notes: z.string().optional(),
});

export const updateClientSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(1).max(30).optional(),
  notes: z.string().optional(),
});

export type CreateClientFormData = z.infer<typeof createClientSchema>;
