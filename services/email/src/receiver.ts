import amqp from "amqplib";
import { defaultSenderEmail, QUEUE_URL, transporter } from "@/config";
import prisma from "./prisma";

const receiveFromQueue = async (queue: string, callback: (message: string) => void) => {

    const connection = await amqp.connect(QUEUE_URL as string);
    const channel = await connection.createChannel();

    const exchange = "order";
    await channel.assertExchange(exchange, "direct", { durable: true });

    const q = await channel.assertQueue(queue, { durable: true });
    await channel.bindQueue(q.queue, exchange, queue);

    channel.consume(
        q.queue,
        (msg) => {
            if (msg) {
                callback(msg.content.toString());
            }
        },
        { noAck: true });
}

receiveFromQueue('send-email', async (msg) => {
    console.log(`Received clear cart message: ${msg}`);

    const parsedBody = JSON.parse(msg);

    const { userEmail, grandTotal, id } = parsedBody;
    const from = defaultSenderEmail;
    const subject = 'Order Confirmation';
    const body = `Thank you for your order. Your order id is ${id}. Your order total is $${grandTotal}`;

    const emailOption = {
        from,
        to: userEmail,
        subject,
        text: body,
    };

    // send the email
    const { rejected } = await transporter.sendMail(emailOption);
    if (rejected.length) {
        console.log('Email rejected: ', rejected);
        return;
    }

    await prisma.email.create({
        data: {
            sender: from,
            recipient: userEmail,
            subject: 'Order Confirmation',
            body,
            source: 'OrderConfirmation',
        },
    });
    console.log('Email sent');
})