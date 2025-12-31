import type { ValidationError } from "express-validator/lib/base.js";

export class ApiError extends Error {
    status;
    errors;

    constructor(status: number, message: string, errors: ValidationError[] = []) {
        super(message);
        this.status = status;
        this.errors = errors;
    }

    static BadRequest(message: string, errors: ValidationError[] = []) {
        return new ApiError(400, message, errors);
    }
    static Unauthorized() {
        return new ApiError(401, "Admin is not authorized");
    }
    static Forbidden(message: string) {
        return new ApiError(403, message);
    }
    static NotFound(message?: string) {
        return new ApiError(404, message ? message : "Resource not found");
    }
}