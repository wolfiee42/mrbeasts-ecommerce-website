import amqp from "amqplib";
import { QUEUE_URL } from "@/config";


const sendToQueue = async (queueName: string, message: string) => {

    const connection = await amqp.connect(QUEUE_URL as string);
    const channel = await connection.createChannel();

    const exchange = "order";
    await channel.assertExchange(exchange, "direct", { durable: false });

    channel.publish(exchange, queueName, Buffer.from(message));
    console.log(`Sent ${message} to ${queueName}`);

    setTimeout(() => {
        connection.close();
        process.exit(0);
    }, 500);
}

export default sendToQueue;