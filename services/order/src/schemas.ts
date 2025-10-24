import { z } from "zod";

export const orderSchema = z.object({
    userId: z.string(),
    userName: z.string(),
    userEmail: z.string(),
    cartSessionId: z.string()
})