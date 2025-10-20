import { NextFunction, Request, Response } from "express";
import { emailCreateSchema } from "@/schemas";
import { transporter } from "@/config";
import prisma from "@/prisma";

const sendEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // validate the request body
        const parsedBody = emailCreateSchema.safeParse(req.body);

        if (!parsedBody.success) {
            return res.status(400).json({ error: parsedBody.error.format() });
        }

        // create email options
        const { sender, recipient, subject, body, source } = parsedBody.data;
        const from = sender || process.env.DEFAULT_SENDER_EMAIL;
        const emailOption = {
            from,
            to: recipient,
            subject,
            text: body,
            source: source || 'email-service',
        }


        // send email
        const { rejected } = await transporter.sendMail(emailOption);
        if (rejected.length) {
            console.log("Failed to send email", rejected);
            return res.status(500).json({ message: "Failed" });
        }

        // create email in database
        const email = await prisma.email.create({
            data: {
                sender,
                recipient,
                subject,
                body,
                source: source || 'email-service',
            }
        })
        res.status(201).json({
            message: "Success",
        });
    } catch (error) {
        next(error);
    }
}

export default sendEmail;