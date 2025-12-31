import bcrypt from "bcryptjs";
import type { QueryResult } from "pg";
import { getPool } from "./postgreService.js";
import tokenService from "./tokenService.js";
import { ApiError } from "../exceptions/ApiError.js";
import { AdminDto } from "../dtos/AdminDto.js";
import type { IAdmin } from "../types/postgresql/IAdmin.js";
import type { IAuth } from "../types/IAuth.js";


class AuthService {
    public async login(email: string, password: string): Promise<IAuth> {
        const pool = getPool();

        const adminResult: QueryResult<IAdmin> = await pool.query(
            'SELECT * FROM admins WHERE email = $1',
            [email]
        );
        if (adminResult.rows.length === 0) {
            throw ApiError.BadRequest('User with this email does not exist');
        }

        const admin = adminResult.rows[0] as IAdmin; // Type assertion (need to refactor later)
        const isPassEquals = await bcrypt.compare(password, admin.hash_password);
        if (!isPassEquals) {
            throw ApiError.BadRequest('Incorrect password');
        }

        const adminDto = new AdminDto(admin);
        const tokens = tokenService.generateTokens({ ...adminDto });
        await pool.query(
            'INSERT INTO tokens (admin_id, token) VALUES ($1, $2) RETURNING *',
            [adminDto.adminId, tokens.refreshToken]
        );
        return {
            ...tokens,
            admin: adminDto
        };
    }

    public async logout(refreshToken: string) {
        const token = tokenService.removeToken(refreshToken);
        return token;
    }

    public async refresh(refreshToken: string): Promise<IAuth> {
        const pool = getPool();

        if (!refreshToken) {
            throw ApiError.Unauthorized();
        }

        const adminData = tokenService.validateRefreshToken(refreshToken);
        const tokenFromDb = await tokenService.findToken(refreshToken);
        if (!adminData || !tokenFromDb) {
            throw ApiError.Unauthorized();
        }

        const adminResult: QueryResult<IAdmin> = await pool.query(
            'SELECT * FROM admins WHERE admin_id = $1',
            [(adminData as IAdmin).admin_id] // Type assertion (need to refactor later)
        );
        const admin = adminResult.rows[0] as IAdmin; // Type assertion (need to refactor later)
        const adminDto = new AdminDto(admin);
        const tokens = tokenService.generateTokens({ ...adminDto });
        await tokenService.saveToken(adminDto.adminId, tokens.refreshToken);
        return {
            ...tokens,
            admin: adminDto
        };
    }
}

export default new AuthService();