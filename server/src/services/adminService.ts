import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import crs from 'crypto-random-string';
import type { QueryResult } from "pg";
import { config } from "../configs/env-config.js";
import { getPool } from "./postgreService.js";
import emailService from "./emailService.js";
import { ApiError } from "../exceptions/ApiError.js";
import { AdminDto } from "../dtos/AdminDto.js";
import type { IAdmin } from "../types/postgresql/IAdmin.js";

class AdminService {
    public async getAdminById(adminId: string) {
        const pool = getPool();

        const adminResult: QueryResult<IAdmin> = await pool.query(
            'SELECT * FROM admins WHERE admin_id = $1',
            [adminId]
        );
        const admin = adminResult.rows[0];
        return admin;
    }

    public async createAgent(email: string) {
        const admin = await this.createAdmin(email, 'agent');
        return admin;
    }

    public async createManager(email: string) {
        const admin = await this.createAdmin(email, 'manager');
        return admin;
    }

    private async createAdmin(email: string, role: 'agent' | 'manager') {
        const pool = getPool();

        const candidate: QueryResult<IAdmin> = await pool.query(
            'SELECT * FROM admins WHERE email = $1',
            [email]
        );
        if (candidate.rows.length > 0) {
            throw ApiError.BadRequest('User with this email already exists');
        }

        const adminId = uuidv4();
        const tempPassword = crs({ length: 12, type: 'alphanumeric' });
        const hashedPassword = await bcrypt.hash(tempPassword, config.BCRYPT_SALT_ROUNDS);

        const adminResult: QueryResult<IAdmin> = await pool.query(
            'INSERT INTO admins (admin_id, username, email, hash_password, role, is_deleted) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [adminId, email.split('@')[0], email, hashedPassword, role, false]
        );

        // sending email
        try {
            const subject = 'Login info';
            const text = `Your temporary password to login: ${tempPassword}`;
            await emailService.sendEmail(email, subject, text);
        } catch (error) {
            console.error("Sending email error:", error);
        }

        const admin = adminResult.rows[0] as IAdmin; // Type assertion (need to refactor later)
        const adminDto = new AdminDto(admin);
        return {
            admin: adminDto,
        };
    }

    async deleteAdmin(requesterId: string, targetId: string) {
        const pool = getPool();

        const requesterResult: QueryResult<IAdmin> = await pool.query(
            'SELECT * FROM admins WHERE admin_id = $1',
            [requesterId]
        );
        if (requesterResult.rows.length === 0) {
            throw ApiError.NotFound("Requester admin does not found");
        }

        const targetResult: QueryResult<IAdmin> = await pool.query(
            'SELECT * FROM admins WHERE admin_id = $1',
            [targetId]
        );
        if (targetResult.rows.length === 0) {
            throw ApiError.NotFound("Target admin does not found");
        }

        const requester = requesterResult.rows[0] as IAdmin; // Type assertion (need to refactor later)
        const target = targetResult.rows[0] as IAdmin; // Type assertion (need to refactor later)

        if (requester.role === 'manager') {
            if (target.role !== 'agent') {
                throw ApiError.Forbidden("Manager can delete only agents");
            }
        }

        if (requester.role === 'superadmin') {
            if (target.role === 'superadmin' && requesterId !== targetId) {
                throw ApiError.Forbidden("Super admins cannot delete other superadmins");
            }
        }

        if (requesterId === targetId) {
            throw ApiError.BadRequest("You cannot delete yourself");
        }

        // await pool.query(
        //     'DELETE FROM admins WHERE admin_id = $1',
        //     [targetId]
        // );
        await pool.query(
            'UPDATE admins SET is_deleted = $1 WHERE admin_id = $2',
            [true, targetId]
        );
    }
}

export default new AdminService();