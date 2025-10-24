import { INVENTORY_SERVICE_URL } from "@/config";
import redis from "@/redis";
import axios from "axios";

export const clearCart = async (id: string) => {
    try {
        const data = await redis.hgetall(`cart:${id}`);
        if (Object.keys(data).length === 0) {
            return;
        }

        const items = Object.keys(data).map((item) => {
            const { quantity, inventoryId } = JSON.parse(data[item]) as {
                quantity: number;
                inventoryId: string;
            }
            return {
                productId: item,
                quantity,
                inventoryId,
            }
        })

        // update inventory
        const request = items.map(item => {
            return axios.put(`${INVENTORY_SERVICE_URL}/inventories/${item.inventoryId}`, {
                quantity: item.quantity,
                actionType: "IN",
            })
        })

        Promise.all(request);

        // clear the cart
        await redis.del(`cart:${id}`);
    } catch (error) {
        throw error;
    }
}