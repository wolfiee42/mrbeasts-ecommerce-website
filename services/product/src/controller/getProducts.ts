import prisma from "@/prisma";
import { Request, Response, NextFunction } from "express";

const getProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // get products
        const products = await prisma.product.findMany({
            select: {
                id: true,
                sku: true,
                name: true,
                price: true,
                inventoryId: true,
            }
        });

        // implement pagination
        // implement filter

        return res.status(200).json(products);
    } catch (error) {
        next(error);
    }
};

export default getProducts;