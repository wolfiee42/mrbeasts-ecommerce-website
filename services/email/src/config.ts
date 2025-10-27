import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
    host: process.env.DEFAULT_HOST || "localhost",
    port: parseFloat(process.env.DEFAULT_PORT || "1025"),
})

export const defaultSenderEmail = process.env.DEFAULT_SENDER_EMAIL || "saifalislam2022@gmail.com";

export const QUEUE_URL = process.env.QUEUE_URL;