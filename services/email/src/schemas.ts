import { z } from "zod";

export const emailCreateSchema = z.object({
    sender: z.string(),
    recipient: z.string().email(),
    subject: z.string(),
    body: z.string(),
    source: z.string().optional(),
})

