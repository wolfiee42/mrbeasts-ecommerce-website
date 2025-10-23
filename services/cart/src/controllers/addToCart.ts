import { CART_TTL, INVENTORY_SERVICE_URL } from "@/config";
import redis from "@/redis";
import { CartItemSchema } from "@/schema";
import { Request, Response, NextFunction } from "express";
import { v4 as uuid } from "uuid";
import axios from "axios";


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

        // check it expired or not
        if (sessionId) {
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

        // check inventory for availability
        const { data: inventory } = await axios.get(`${INVENTORY_SERVICE_URL}/inventories/${parsedBody.data.inventoryId}`)
        if (Number(inventory.quantity) < parsedBody.data.quantity || inventory.quantity === 0) {
            return res.status(400).json({
                message: "Inventory not available",
            });
        }
        // add item to the cart
        // TODO: check if the product already exists in the cart
        // LOGIC: parsedBody.data.quantity - wxistingQuantity

        await redis.hset(
            `cart:${sessionId}`,
            parsedBody.data.productId,
            JSON.stringify({
                quantity: parsedBody.data.quantity,
                inventoryId: parsedBody.data.inventoryId,
            })
        )

        // TODO: update the inventory
        await axios.put(`${INVENTORY_SERVICE_URL}/inventories/${parsedBody.data.inventoryId}`, {
            quantity: Number(parsedBody.data.quantity),
            actionType: "OUT"
        })


        return res.status(201).json({
            message: "Item added to cart.",
            sessionId
        });



    } catch (error) {
        next(error);
    }
}

export default addToCart;