import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import { checkout, getOrderById, getOrders } from "./controllers";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// logging middleware
app.use(morgan("dev"));


app.get("/health", (_req, res) => {
    res.status(200).json({ status: "UP" });
});

//routes
app.post('/orders/checkout', checkout);
app.get('/orders/:id', getOrderById)
app.get('/orders', getOrders);

// 404 handler
app.use((_req, res) => {
    res.status(404).json({ error: "Not Found" });
});

// error handler
app.use((err, _req, res, _next) => {
    console.log(err.stack);
    res.status(500).json({ error: "Internal Server Error" });
});

const port = process.env.PORT || 4007;
const servicename = process.env.SERVICE_NAME || "order-service";

app.listen(port, () => {
    console.log(`${servicename} is running on port ${port}`);
});