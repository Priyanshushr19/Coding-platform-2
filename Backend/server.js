import dotenv from "dotenv";
dotenv.config();

console.log("Redis URL loaded:", !!process.env.REDIS_PASSWORD);

import express from "express";
const app = express();
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import authRouter from "./src/routes/userAuth.js";
// import {redisClient} from "./src/config/redis.js";
import problemRouter from "./src/routes/ProblemCreator.js";
import submitRouter from "./src/routes/submit.js";
import cors from "cors";
import aiRouter from "./src/routes/aiChatting.js";
import videoRouter from "./src/routes/videoCreator.js";
import discussionRouter from "./src/routes/discussionRouter.js";
import contestRouter from "./src/routes/contestRoutes.js";
import customRunRouter from "./src/routes/customRun.js";
import apiProblemsRouter from "./src/routes/apiProblems.js";
import { apiRateLimiter } from "./src/middleware/rateLimiter.js";
import { createClient } from 'redis';

// Security and CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || 'https://coding-platform-2-1.onrender.com' || 'http://localhost:5173',
    credentials: true,
    optionsSuccessStatus: 200
}));

// Body parsing with size limits (prevent DoS)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request timeout middleware
app.use((req, res, next) => {
    req.setTimeout(30000, () => {
        res.status(408).json({ error: 'Request timeout' });
    });
    next();
});

// Global rate limiting for /api routes
app.use("/api", apiRateLimiter);

// Routes
app.use('/user', authRouter);
app.use('/problem', problemRouter);
app.use('/submission', submitRouter);
app.use('/ai', aiRouter);
app.use("/video", videoRouter);
app.use('/discussion', discussionRouter);
app.use("/api/contests", contestRouter);

// New API-prefixed routes
app.use("/api/submission", customRunRouter);
app.use("/api/problems", apiProblemsRouter);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Global error handler middleware (MUST be last)
app.use((err, req, res, next) => {
    console.error('Error:', err);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Validation error',
            message: Object.values(err.errors).map(e => e.message).join(', ')
        });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        return res.status(409).json({
            error: 'Duplicate entry',
            message: 'This record already exists'
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Invalid token' });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' });
    }

    // Default error
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

let server;

const main = async () => {
    try {
        // MongoDB connection with error handling
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log("✅ MongoDB Connected");

        // Redis connection with graceful degradation
        try {
            const redisClient = createClient({
                
                username: 'default',
            
                
                password: process.env.REDIS_PASSWORD,
                socket: {
                    host: 'redis-17216.crce182.ap-south-1-1.ec2.cloud.redislabs.com',
                    port: 17216
                }
            });

            await redisClient.connect();
            console.log("✅ Redis Connected");

            redisClient.on('error', (err) => {
                console.error('Redis Client Error:', err);
            });

            redisClient.on('connect', () => {
                console.log('Redis Client Connected');
            });
        } catch (redisError) {
            console.warn("⚠️ Redis connection failed, continuing without cache:", redisError.message);
        }


        server = app.listen(process.env.PORT || 3000, () => {
            console.log(`✅ Server listening on port ${process.env.PORT || 3000}`);
        });

        // Graceful shutdown
        const gracefulShutdown = async (signal) => {
            console.log(`\n${signal} received. Starting graceful shutdown...`);

            server.close(async () => {
                console.log('HTTP server closed');

                try {
                    await mongoose.connection.close();
                    console.log('MongoDB connection closed');
                } catch (err) {
                    console.error('Error closing MongoDB:', err);
                }

                try {
                    if (redisClient.isOpen) {
                        await redisClient.quit();
                        console.log('Redis connection closed');
                    }
                } catch (err) {
                    console.error('Error closing Redis:', err);
                }

                process.exit(0);
            });

            // Force shutdown after 10 seconds
            setTimeout(() => {
                console.error('Forced shutdown after timeout');
                process.exit(1);
            }, 10000);
        };

        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

        // Handle uncaught errors
        process.on('unhandledRejection', (reason, promise) => {
            console.error('Unhandled Rejection at:', promise, 'reason:', reason);
        });

        process.on('uncaughtException', (error) => {
            console.error('Uncaught Exception:', error);
            gracefulShutdown('uncaughtException');
        });

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

main();
