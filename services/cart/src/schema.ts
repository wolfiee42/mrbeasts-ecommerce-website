import { z } from "zod";

export const CartItemSchema = z.object({
    productId: z.string(),
    quantity: z.number(),
    inventoryId: z.string(),
})