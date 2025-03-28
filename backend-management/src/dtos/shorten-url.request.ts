import { z } from "zod";

export const ShortenUrlRequestSchema = z.object({
    long_url: z.string().url(),
    expiry: z.preprocess(
        (val) => (typeof val === "string" ? new Date(val) : val),
        z.date().refine((date) => !isNaN(date.getTime()), {
            message: "Invalid date",
        })
    ).optional(),
    password: z.string().optional(),
    custom_url: z.string()
        // blacklist 400 and 404 as we use them to cache miss
        .refine(val => val !== '404' && val !== '400', {
            message: "url already exists"
        })
        .optional(),
});

export type ShortenUrlRequest = z.infer<typeof ShortenUrlRequestSchema>;