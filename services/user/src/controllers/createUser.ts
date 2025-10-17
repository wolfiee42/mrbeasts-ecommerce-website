import { NextFunction, Request, Response } from "express";
import { createUserSchema } from "@/schemas";
import prisma from "@/prisma";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {

        // parse request body
        const parsedBody = createUserSchema.safeParse(req.body);
        if (!parsedBody.success) {
            return res.status(400).json({
                message: "Invalid request body",
                error: parsedBody.error.format(),
            });
        }

        // check if the user already exists or not
        const existUser = await prisma.user.findUnique({
            where: { authUserId: parsedBody.data.authUserId }
        });

        if (existUser) {
            return res.status(400).json({
                message: "User already exists",
            });
        }

        // create user
        const user = await prisma.user.create({
            data: parsedBody.data
        })

        res.status(201).json({
            message: "User created successfully",
            user
        });

    } catch (error) {
        next(error);
    }
}

export default createUser;