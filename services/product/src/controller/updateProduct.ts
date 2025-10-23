import prisma from "@/prisma";
import { ProductUpdateDTOSchema } from "@/schemas";
import { NextFunction, Request, Response } from "express";

const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const parsedBody = ProductUpdateDTOSchema.safeParse(req.body);
        if (!parsedBody.success) {
            return res.status(400).json({ message: "Invalid request body", errors: parsedBody.error.format() });
        }

        // check if product exists
        const product = await prisma.product.findUnique({
            where: { id }
        })

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // update product
        const updatedProduct = await prisma.product.update({
            where: { id },
            data: parsedBody.data
        })

        return res.status(200).json({ message: "Product updated successfully", data: updatedProduct });
    } catch (error) {
        next(error);
    }
}

export default updateProduct;