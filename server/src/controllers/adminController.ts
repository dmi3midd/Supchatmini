import { validationResult } from "express-validator";
import type { NextFunction, Request, Response } from "express";
import adminService from "../services/adminService.js";
import { ApiError } from "../exceptions/ApiError.js";
import type { IAdmin } from "../types/postgresql/IAdmin.js";


class AdminController {
    public async getAdminById(req: Request, res: Response, next: NextFunction) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest("Validation error", errors.array()));
            }
            const { adminId } = req.body;
            const adminData = await adminService.getAdminById(adminId);
            return res.json(adminData);
        } catch (error) {
            next(error);
        }
    }

    public async getAdmins(req: Request, res: Response, next: NextFunction) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest("Validation error", errors.array()));
            }
            const admins = await adminService.getAdmins();
            return res.json(admins);
        } catch (error) {
            next(error);
        }
    }

    public async createAgent(req: Request, res: Response, next: NextFunction) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest("Validation error", errors.array()));
            }
            const { email } = req.body;
            const adminData = await adminService.createAgent(email);
            return res.json(adminData);
        } catch (error) {
            next(error);
        }
    }

    public async createManager(req: Request, res: Response, next: NextFunction) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest("Validation error", errors.array()));
            }
            const { email } = req.body;
            const adminData = await adminService.createManager(email);
            return res.json(adminData);
        } catch (error) {
            next(error);
        }
    }

    public async deleteAdmin(req: Request & { admin?: IAdmin }, res: Response, next: NextFunction) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest("Validation error", errors.array()));
            }
            const requesterId = req.admin?.admin_id as string; // Type assertion (need to refactor later)
            const { targetId } = req.body;
            await adminService.deleteAdmin(requesterId, targetId);
            return res.json("Admin was deleted");
        } catch (error) {
            next(error);
        }
    }
}

export default new AdminController();