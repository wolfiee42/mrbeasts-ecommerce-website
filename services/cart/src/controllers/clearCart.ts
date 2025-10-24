import redis from "@/redis";
import { NextFunction, Request, Response } from "express";

const clearCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const cartSessionId = req.headers["x-cart-session-id"] as string || null;
        if (!cartSessionId) {
            return res.status(200).json({ message: "Cart is already empty" })
        }

        const exist = await redis.exists(`sessions:${cartSessionId}`);
        if (!exist) {
            delete req.headers["x-cart-session-id"];
            return res.status(200).json({ message: "Cart is already empty" })
        }

        // clear cart
        await redis.del(`sessions:${cartSessionId}`);
        await redis.del(`cart:${cartSessionId}`);
        return res.status(200).json({ message: "Cart cleared successfully" })

    } catch (error) {
        next(error);
    }
}

export default clearCart;