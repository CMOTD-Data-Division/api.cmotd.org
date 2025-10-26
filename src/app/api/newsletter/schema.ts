import z from "zod";

const newsletterSubSchema = z.object({
  name: z.string().min(1, {message: "Name is required"}),
  email: z.string().email({message: "Invalid email address"}),
  website: z
    .union([z.literal(""), z.undefined()])
    .optional()
    .describe("Honeypot; must be empty"),
  agreement: z.literal("on", { errorMap: () => ({ message: "Consent is required" }) }),
})

type NewsletterSubSchema = z.infer<typeof newsletterSubSchema>
export { newsletterSubSchema };    export type { NewsletterSubSchema };

