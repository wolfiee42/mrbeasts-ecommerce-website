
import dotenv from "dotenv";

dotenv.config({
    path: ".env",
})

export const REDIS_PORT = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379;
export const REDIS_HOST = process.env.REDIS_HOST || "localhost";

export const CART_TTL = process.env.CART_TTL ? parseInt(process.env.CART_TTL) : 120; // 2 minutes

export const INVENTORY_SERVICE_URL = process.env.INVENTORY_SERVICE_URL || "http://localhost:4002";

export const QUEUE_URL = process.env.QUEUE_URL;