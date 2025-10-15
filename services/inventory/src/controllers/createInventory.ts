import { Request, Response, NextFunction } from "express";
import prisma from "@prisma/client";
import { InventoryCreateDTOSchema } from "@/schemas";

const createInventory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // parse body
        const parsedBody = InventoryCreateDTOSchema.safeParse(req.body);
        if (!parsedBody.success) {
            return res.status(400).json({ error: parsedBody.error.message });
        }
    } catch (error) {
        next(error);
    }
};

export default createInventory;
