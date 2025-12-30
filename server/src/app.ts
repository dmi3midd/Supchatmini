import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './configs/env-config.js';

export const app = express();

app.use(express.json());
app.use(cors({
    credentials: true,
    origin: config.CLIENT_URL
}));
app.use(cookieParser());