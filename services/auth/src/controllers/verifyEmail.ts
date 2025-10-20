import { NextFunction, Request, Response } from "express";
import prisma from "@/prisma";
import { VerifyEmailSchema } from "@/schemas";
import { UserStatus, VerificationStatus } from "@prisma/client";
import axios from "axios";
import { EMAIL_SERVICE_URL } from "@/config";

const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // validate the request body
        const parsedBody = VerifyEmailSchema.safeParse(req.body);
        if (!parsedBody.success) {
            return res.status(400).json({ error: parsedBody.error.format() });
        }

        // check if user exists
        const user = await prisma.user.findUnique({
            where: {
                email: parsedBody.data.email
            }
        })
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // find the verification code
        const verificationCode = await prisma.verificationCode.findFirst({
            where: {
                userId: user.id,
                code: parsedBody.data.code,
            }
        })
        if (!verificationCode) {
            return res.status(404).json({ error: "Verification code not found" });
        }

        // check if verification code is expired
        if (verificationCode.expiresAt < new Date()) {
            return res.status(400).json({ error: "Verification code expired" });
        }

        // update user status to verified
        await prisma.user.update({
            where: { id: user.id },
            data: {
                verified: true,
                status: UserStatus.ACTIVE
            }
        })

        // updat verified code to used
        await prisma.verificationCode.update({
            where: { id: verificationCode.id },
            data: {
                status: VerificationStatus.USED,
                verifiedAt: new Date(),
            }
        })


        // send email verified notification to user
        await axios.post(`${EMAIL_SERVICE_URL}/emails/send`, {
            recipient: user.email,
            subject: "Email Verified",
            text: "Your email has been verified successfully",
            source: 'email-verified',
        });

        res.status(200).json({ message: "Email verified successfully" });
    } catch (error) {
        next(error);
    }
}

export default verifyEmail;