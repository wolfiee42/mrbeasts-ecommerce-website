import amqp from "amqplib";
import { QUEUE_URL } from "@/config";
import redis from "./redis";

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

receiveFromQueue('clear-cart', (msg) => {
    console.log(`Received clear cart message: ${msg}`);

    const parsedMessage = JSON.parse(msg);
    const cartSessionId = parsedMessage.cartSessionId;

    redis.del(`cart:${cartSessionId}`)
    redis.del(`session:${cartSessionId}`)

    console.log("cart cleared");
})