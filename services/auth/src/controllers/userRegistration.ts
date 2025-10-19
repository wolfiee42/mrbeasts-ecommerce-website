import prisma from "@/prisma";
import { userCreateSchema } from "@/schemas";
import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import axios from "axios";
import { USER_SERVICE_URL } from "@/config";

const userRegistration = async (req: Request, res: Response, next: NextFunction) => {
    try {

        // validate the request body
        const parsedBody = userCreateSchema.safeParse(req.body);
        if (!parsedBody.success) {
            return res.status(400).json({ error: parsedBody.error.format() });
        }

        // check if the user already exists
        const existUser = await prisma.user.findUnique({
            where: {
                email: parsedBody.data.email,
            }
        })
        if (existUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        // hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(parsedBody.data.password, salt);

        // create user
        const user = await prisma.user.create({
            data: {
                ...parsedBody.data,
                password: hashedPassword,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                verified: true,
                status: true,
            }
        });

        // create user in user service
        const { data: userData } = await axios.post(`${USER_SERVICE_URL}/users`, {
            authUserId: user.id,
            name: user.name,
            email: user.email,
        })

        //TODO: renerate verification code
        //TODO: send verification email



        res.status(201).json({
            user,
        });

    } catch (error) {
        next(error);
    }
}
export default userRegistration;