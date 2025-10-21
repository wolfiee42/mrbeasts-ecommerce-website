import express, { NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { configureRoutes } from "./utils";

// accessing environment variables
dotenv.config();

const app = express();

// security middleware
app.use(helmet());


// rate limiting middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `windowMs`
    handler: (_req, res) => {
        return res.status(429).json({
            message: "Too many requests, please try again later",
        });
    }
});

app.use('/api', limiter);

// logging middleware
app.use(morgan("dev"));

app.use(express.json());
app.use(cors());

// TODO: Auth middleware

configureRoutes(app);


// health check route
app.get('/health', (req, res) => {
    res.status(200).json({ status: "API Gateway is running" });
});

// error handling middleware
app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Internal Server Error" });
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
    console.log(`API Gateway is running on port ${PORT}`);
});