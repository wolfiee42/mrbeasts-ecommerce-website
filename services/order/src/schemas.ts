import { z } from "zod";

export const orderSchema = z.object({
    userId: z.string(),
    userName: z.string(),
    userEmail: z.string(),
    cartSessionId: z.string()
})

export const CartItemSchema = z.object({
    quantity: z.number(),
    inventoryId: z.string(),
    productId: z.string(),
})