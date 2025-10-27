import { NextFunction, Request, Response } from "express";
import { orderSchema, CartItemSchema } from '@/schemas'
import axios from "axios";
import { CART_SERVICE_URL, EMAIL_SERVICE_URL, PRODUCT_SERVICE_URL } from "@/config";
import { z } from "zod";
import prisma from "@/prisma";
import sendToQueue from "@/queue";


const checkout = async (req: Request, res: Response, next: NextFunction) => {
    try {

        // validate request body
        const parsedBody = orderSchema.safeParse(req.body);
        if (!parsedBody.success) {
            return res.status(400).json({ errors: parsedBody.error.format() });
        }

        // get cart items using cart session id
        const { data: cartData } = await axios.get(`${CART_SERVICE_URL}/cart/me`, {
            headers: {
                "x-cart-session-id": parsedBody.data.cartSessionId
            }
        })

        const cartItems = z.array(CartItemSchema).safeParse(cartData.items);
        if (!cartItems.success) {
            return res.status(400).json({ errors: cartItems.error.format() });
        }

        // if cart is empty return 400
        if (cartItems.data.length === 0) {
            return res.status(400).json({ error: "Cart is empty" });
        }


        // find all product details using product id from cart
        const productDetails = await Promise.all(
            cartItems.data.map(async (item) => {
                const { data: product } = await axios.get(`${PRODUCT_SERVICE_URL}/products/${item.productId}`)
                return {
                    productId: item.productId as string,
                    productName: product.name as string,
                    sku: product.sku as string,
                    price: product.price as number,
                    quantity: item.quantity,
                    total: product.price * item.quantity,
                }
            })
        )

        const subTotal = productDetails.reduce((acc, item) => acc + item.total, 0);
        const tax = 0;
        const grandTotal = subTotal + tax;

        // create order and order items
        const order = await prisma.order.create({
            data: {
                userId: parsedBody.data.userId,
                userName: parsedBody.data.userName,
                userEmail: parsedBody.data.userEmail,
                subTotal,
                tax,
                grandTotal,
                OrderItems: {
                    create: productDetails.map((item) => ({
                        ...item
                    }))
                }
            }
        })

        // invoke cart service
        await axios.get(`${CART_SERVICE_URL}/cart/clear`, {
            headers: {
                "x-cart-session-id": parsedBody.data.cartSessionId
            }
        })

        // invoke email service
        await axios.post(`${EMAIL_SERVICE_URL}/emails/send`, {
            sender: process.env.DEFAULT_SENDER_EMAIL,
            recipient: parsedBody.data.userEmail,
            subject: "Order Confirmation",
            body: `Your order has been placed successfully. Your order id is ${order.id}.`,
            source: "order-service",
        })


        // sendToQueue('send-email', JSON.stringify(order));
        // sendToQueue('cart-clear', JSON.stringify({ cartSessionId: parsedBody.data.cartSessionId }));

        return res.status(201).json({ data: order })

    } catch (error) {
        next(error);
    }
}


export default checkout;