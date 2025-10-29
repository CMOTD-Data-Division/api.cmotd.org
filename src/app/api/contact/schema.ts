import z from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(1, { message: "Name is required" }),
  email: z.string().trim().email({ message: "Invalid email address" }),
  message: z
    .string()
    .trim()
    .min(5, { message: "Message must be at least 5 characters" })
    .max(5000, { message: "Message is too long" }),
  // Honeypot: must be empty (or missing)
    website: z.union([z.literal(""), z.undefined()]).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
