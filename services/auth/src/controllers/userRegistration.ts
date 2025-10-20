import prisma from "@/prisma";
import { userCreateSchema } from "@/schemas";
import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import axios from "axios";
import { EMAIL_SERVICE_URL, USER_SERVICE_URL } from "@/config";
import { VerificationType } from "@prisma/client";

const generateVerificationCode = () => {

    // get current date and time
    const timestamp = new Date().getTime().toString();

    // generate 2 random digits
    const randomNum = Math.floor(10 + Math.random() * 90);

    // combine them and extract the last 5 digits
    const verficationCode = (timestamp + randomNum).slice(-5);

    return verficationCode;
}

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

        // generate verification code
        const code = generateVerificationCode();

        // send verification email
        await axios.post(`${EMAIL_SERVICE_URL}/emails/send`, {
            recipient: user.email,
            subject: "Email Verification",
            body: `Your verification code is ${code}`,
            source: 'user-registration',
        });

        // store verification code in database
        await prisma.verificationCode.create({
            data: {
                userId: user.id,
                code,
                type: VerificationType.ACCOUNT_VERIFICATION,
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
            }
        })

        res.status(201).json({
            user,
            message: "User registered successfully",
        });

    } catch (error) {
        next(error);
    }
}
export default userRegistration;