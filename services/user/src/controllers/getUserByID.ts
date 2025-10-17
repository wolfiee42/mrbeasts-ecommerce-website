import prisma from "@/prisma";
import { User } from "@prisma/client";
import { NextFunction, Request, Response } from "express";


// /users/:id?field=id|authUserId

const getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {

        // get user param id and query
        const { id } = req.params;
        const { field } = req.query;

        // get user by id
        let user: User | null = null;

        if (field === 'authUserId') {
            user = await prisma.user.findUnique({
                where: { authUserId: id }
            });
        } else {
            user = await prisma.user.findUnique({
                where: { id }
            });
        }

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            })
        }

        return res.status(200).json({
            message: "User fetched successfully",
            user
        });
    } catch (error) {
        next(error);
    }
}

export default getUserById;