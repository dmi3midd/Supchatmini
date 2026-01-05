import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../exceptions/ApiError.js";
import type { IAdmin } from "../types/postgresql/IAdmin.js";

type Role = 'superadmin' | 'manager' | 'agent';

export function accessMiddleware(allowedRoles: Role[]) {
    return (req: Request & { admin?: IAdmin }, res: Response, next: NextFunction) => {
        try {
            if (!req.admin) {
                return next(ApiError.Unauthorized());
            }

            const hasAccess = allowedRoles.includes(req.admin.role as Role);

            if (!hasAccess) {
                return next(ApiError.Forbidden("You do not have permissions"));
            }

            return next();
        } catch (error) {
            return next(ApiError.BadRequest("Access controll error"));
        }
    };
}