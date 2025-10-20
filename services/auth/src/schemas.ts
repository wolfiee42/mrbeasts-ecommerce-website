import { z } from "zod";

export const userCreateSchema = z.object({
    name: z.string().min(3).max(255),
    email: z.string().email(),
    password: z.string().min(8).max(255),
})

export const userLoginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
})

export const AccessTokenSchema = z.object({
    accessToken: z.string(),
})

export const VerifyEmailSchema = z.object({
    email: z.string().email(),
    code: z.string(),
})