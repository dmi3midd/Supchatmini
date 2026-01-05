import type { Request, Response, NextFunction } from "express";
import type { IAdmin } from "../types/postgresql/IAdmin.js";
import { ApiError } from "../exceptions/ApiError.js";
import tokenService from "../services/tokenService.js";
import adminService from "../services/adminService.js";
import type { IAdminDto } from "../types/dtos/IAdminDto.js";

export async function authMiddleware(req: Request & { admin?: IAdmin }, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return next(ApiError.Unauthorized());
        }

        const parts = authHeader.split(" ");
        if (parts[0]) {
            if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
                return next(ApiError.Unauthorized());
            }
        }

        const accessToken = parts[1];
        if (!accessToken) {
            return next(ApiError.Unauthorized());
        }
        const adminDataFromToken = tokenService.validateAccessToken(accessToken) as IAdminDto; // Type assertion (need to refactor later)
        if (!adminDataFromToken) {
            return next(ApiError.Unauthorized());
        }

        const currentAdmin = await adminService.getAdminById(adminDataFromToken.adminId);
        if (!currentAdmin || currentAdmin.is_deleted) {
            return next(ApiError.Unauthorized());
        }
        req.admin = currentAdmin;
        return next();
    } catch (error) {
        return next(ApiError.Unauthorized());
    }
}