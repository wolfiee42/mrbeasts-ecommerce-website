import prisma from "@/prisma";
import { userLoginSchema } from "@/schemas";
import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { LoginAttempt } from "@prisma/client";

type LoginHistory = {
    userId: string;
    ipAddress: string;
    userAgent: string;
    attempt: LoginAttempt;
}

const createLoginHistory = async (loginHistory: LoginHistory) => {
    await prisma.loginHistory.create({
        data: {
            userId: loginHistory.userId,
            ipAdress: loginHistory.ipAddress,
            userAgent: loginHistory.userAgent,
            attempt: loginHistory.attempt,
        },
    });
}



const userLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // get ip address and user agent
        const ipAddress = req.headers["x-forwarded-for"] || req.ip;
        const userAgent = req.headers["user-agent"];

        // validate the request body
        const parsedBody = userLoginSchema.safeParse(req.body);
        if (!parsedBody.success) {
            return res.status(400).json({ error: parsedBody.error.format() });
        }

        // check if the user exists
        const existUser = await prisma.user.findUnique({
            where: { email: parsedBody.data.email }
        });
        if (!existUser) {
            await createLoginHistory({
                userId: "Guest",
                ipAddress: ipAddress as string,
                userAgent: userAgent as string,
                attempt: LoginAttempt.FAILED,
            });
            return res.status(400).json({ error: "User not found" });
        }

        // check if the password is correct
        const isPasswordCorrect = await bcrypt.compare(parsedBody.data.password, existUser.password);
        if (!isPasswordCorrect) {
            await createLoginHistory({
                userId: existUser.id,
                ipAddress: ipAddress as string,
                userAgent: userAgent as string,
                attempt: LoginAttempt.FAILED,
            });
            return res.status(400).json({ error: "Invalid credentials" });
        }

        // check if the user is verified
        if (existUser.verified) {
            await createLoginHistory({
                userId: existUser.id,
                ipAddress: ipAddress as string,
                userAgent: userAgent as string,
                attempt: LoginAttempt.FAILED,
            });
            return res.status(400).json({ error: "User is not verified" });
        };

        // check if the user is active
        if (existUser.status !== "ACTIVE") {
            await createLoginHistory({
                userId: existUser.id,
                ipAddress: ipAddress as string,
                userAgent: userAgent as string,
                attempt: LoginAttempt.FAILED,
            });
            return res.status(400).json({ error: "User is not active" });
        }

        // create access token
        const accessToken = jwt.sign(
            {
                id: existUser.id,
                name: existUser.name,
                email: existUser.email,
                role: existUser.role,
            },
            process.env.JWT_SECRET || "My_Secret_Key" as string,
            {
                expiresIn: "2h",
            }
        )

        // create login history
        await createLoginHistory({
            userId: existUser.id,
            ipAddress: ipAddress as string,
            userAgent: userAgent as string,
            attempt: LoginAttempt.SUCCESS,
        });

        return res.status(200).json({
            accessToken,
        });

    } catch (error) {
        next(error);
    }
}
export default userLogin;