import { validationResult } from "express-validator";
import type { NextFunction, Request, Response } from "express";

import authService from "../services/authService.js";
import { ApiError } from "../exceptions/ApiError.js";


class AuthController {
    public async login(req: Request, res: Response, next: NextFunction) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest("Validation error", errors.array()));
            }
            const { email, password } = req.body;
            const adminData = await authService.login(email, password);
            res.cookie('refreshToken', adminData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
            return res.json(adminData);
        } catch (error) {
            next(error);
        }
    }

    public async logout(req: Request, res: Response, next: NextFunction) {
        try {
            const { refreshToken } = req.cookies;
            const token = await authService.logout(refreshToken);
            res.clearCookie('refreshToken');
            return res.json(token);
        } catch (error) {
            next(error);
        }
    }

    public async refresh(req: Request, res: Response, next: NextFunction) {
        try {
            const { refreshToken } = req.cookies;
            const adminData = await authService.refresh(refreshToken);
            res.cookie('refreshToken', adminData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
            return res.json(adminData);
        } catch (error) {
            next(error);
        }
    }
}

export default new AuthController();