import { NextFunction, Request, Response } from "express";
import redis from "@/redis";

const getMyCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const cartSessionId = req.headers["x-cart-session-id"] as string || null;

        if (!cartSessionId) {
            return res.status(200).json({ data: [] });
        }


        // check if the seesion exist in redis
        const session = await redis.exists(`sessions:${cartSessionId}`);
        if (!session) {
            await redis.del(`cart:${cartSessionId}`);
            return res.status(200).json({ data: [] });
        }

        const items = await redis.hgetall(`cart:${cartSessionId}`);

        if (Object.keys(items).length === 0) {
            return res.status(200).json({ data: [] });
        }
        
        // format the items
        const formattedItems = Object.keys(items).map((key) => {
            const { quantity, inventoryId } = JSON.parse(items[key]) as {
                quantity: number;
                inventoryId: string;
            }
            return { productId: key, quantity, inventoryId };
        })

        return res.status(200).json({ data: formattedItems });

    } catch (error) {
        next(error);
    }
}

export default getMyCart;