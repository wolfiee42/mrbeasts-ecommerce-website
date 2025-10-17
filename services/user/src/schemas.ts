import { z } from "zod";

export const createUserSchema = z.object({
    authUserId: z.string(),
    name: z.string(),
    email: z.string().email(),
    address: z.string().optional(),
    phone: z.string().optional(),
})

export const updateUserSchema = createUserSchema.omit({ authUserId: true }).partial();

