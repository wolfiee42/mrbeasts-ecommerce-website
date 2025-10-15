import prisma from "@/prisma";
import { Request, Response, NextFunction } from "express";

const getInventoryDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {

        // get inventory details
        const { id } = req.params;

        const inventory = await prisma.inventory.findUnique({
            where: { id },
            include: {
                histories: {
                    orderBy: {
                        createdAt: "desc"
                    }
                }
            }
        });

        if (!inventory) {
            return res.status(404).json({ error: "Inventory not found" });
        }

        return res.status(200).json(inventory);

    } catch (error) {
        next(error);
    }
};

export default getInventoryDetails;