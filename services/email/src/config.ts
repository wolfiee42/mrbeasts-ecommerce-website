import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
    host: process.env.DEFAULT_HOST || "localhost",
    port: parseFloat(process.env.DEFAULT_PORT || "1025"),
})

export const defaultSenderEmail = process.env.DEFAULT_SENDER_EMAIL || "saifalislam2022@gmail.com";