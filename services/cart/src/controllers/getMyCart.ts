import { NextFunction, Request, Response } from "express";
import redis from "@/redis";

const getMyCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const cartSessionId = req.headers["x-cart-session-id"] as string || null;

        if (!cartSessionId) {
            return res.status(200).json({ data: {} });
        }


        // check if the seesion exist in redis
        const session = await redis.exists(`sessions:${cartSessionId}`);
        if (!session) {
            await redis.del(`cart:${cartSessionId}`); 
            return res.status(200).json({ data: {} });
        }

        const cart = await redis.hgetall(`cart:${cartSessionId}`);

        return res.status(200).json({ data: cart });

    } catch (error) {
        next(error);
    }
}

export default getMyCart;