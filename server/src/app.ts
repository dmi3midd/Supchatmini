import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './configs/env-config.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import authRouter from './routers/authRouter.js';

export const app = express();

app.use(express.json());
app.use(cors({
    credentials: true,
    origin: config.CLIENT_URL
}));
app.use(cookieParser());
app.use('/api/auth', authRouter);
app.use(errorMiddleware);