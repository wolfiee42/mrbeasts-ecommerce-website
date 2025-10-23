import { CART_TTL } from "@/config";
import redis from "@/redis";
import { CartItemSchema } from "@/schema";
import { Request, Response, NextFunction } from "express";
import { v4 as uuid } from "uuid";


const addToCart = async (req: Request, res: Response, next: NextFunction) => {
    try {

        // validate request body
        const parsedBody = CartItemSchema.safeParse(req.body);
        if (!parsedBody.success) {
            return res.status(400).json({
                errors: parsedBody.error.format(),
            });
        }

        //check session id is exist
        let sessionId = req.headers["x-cart-session-id"] as string || null;

        if (sessionId) {
            // check it expired or not
            const exist = await redis.exists(`sessions:${sessionId}`)
            if (!exist) {
                sessionId = null;
            }
        }

        if (!sessionId) {
            // generate a session id
            sessionId = uuid();
            console.log("New session id: ", sessionId);

            // store it in redis
            await redis.setex(`sessions:${sessionId}`, CART_TTL, sessionId)

            // store it in headers
            res.setHeader("x-cart-session-id", sessionId)
        }

    } catch (error) {
        next(error);
    }
}

export default addToCart;