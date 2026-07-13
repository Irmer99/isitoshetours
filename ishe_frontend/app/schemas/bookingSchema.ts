import { z } from "zod";

export const clientBookingSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(9, "Valid phone required"),
  travelDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Valid date required",
  }),
  participants: z.number().int().min(1, "At least 1 required"),
  itinerary: z.string().min(1, "Itinerary is required"),
  itineraryTitle: z.string().optional(),
  discountCode: z.string().optional(),
  notes: z.string().optional(),
});

export type ClientBookingFormData = z.infer<typeof clientBookingSchema>;
