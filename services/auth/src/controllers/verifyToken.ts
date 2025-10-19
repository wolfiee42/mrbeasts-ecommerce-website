import prisma from "@/prisma";
import { AccessTokenSchema } from "@/schemas";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";


const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { accessToken } = req.body;

        // validate the request body
        const parsedBody = AccessTokenSchema.safeParse(req.body);
        if (!parsedBody.success) {
            return res.status(400).json({ error: parsedBody.error.format() });
        }

        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET || "My_Secret_Key" as string);
        if (!decoded) {
            return res.status(400).json({ error: "Invalid token" });
        }

        const user = await prisma.user.findUnique({
            where: {
                id: (decoded as any).id,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            }
        })
        if (!user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        return res.status(200).json({
            message: "Authorized",
            user,
        });
    } catch (error) {
        next(error);
    }
}


export default verifyToken;