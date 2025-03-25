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
    custom_url: z.string().optional(),
});

export type ShortenUrlRequest = z.infer<typeof ShortenUrlRequestSchema>;