import { Request, Response, NextFunction } from "express";
import prisma from "@/prisma";
import { InventoryCreateDTOSchema } from "@/schemas";

const createInventory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // parse body
        const parsedBody = InventoryCreateDTOSchema.safeParse(req.body);
        if (!parsedBody.success) {
            return res.status(400).json({ error: parsedBody.error.format() });
        }

        // create inventory
        const inventory = await prisma.inventory.create({
            data: {
                ...parsedBody.data,
                histories: {
                    create: {
                        actionType: "IN",
                        quantityChange: parsedBody.data.quantity,
                        lastQuantity: 0,
                        newQuantity: parsedBody.data.quantity,
                    }
                }
            },
            select: {
                id: true,
                productId: true,
            }
        });

        return res.status(201).json(inventory);
    } catch (error) {
        next(error);
    }
};

export default createInventory;
