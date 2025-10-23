import { z } from "zod";
import { Status } from "../generated/prisma/index.js";


export const ProductCreateDTOSchema = z.object({
    sku: z.string().min(3).max(10),
    name: z.string().min(3).max(255),
    description: z.string().optional(),
    price: z.number().optional().default(0),
    status: z.nativeEnum(Status).optional().default(Status.DRAFT),
})

export const ProductUpdateDTOSchema = z.object({
    name: z.string().min(3).max(255).optional(),
    description: z.string().optional(),
    price: z.number().optional().default(0),
    status: z.nativeEnum(Status).optional().default(Status.DRAFT),
})