import prisma from "@/prisma";
import { NextFunction, Request, Response } from "express";

const getEmails = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // get emails
        const allEmails = await prisma.email.findMany();
        if (!allEmails) {
            return res.status(404).json({ message: "No emails found" });
        }
        res.status(200).json(allEmails);
    } catch (error) {
        next(error);
    }
}

export default getEmails;