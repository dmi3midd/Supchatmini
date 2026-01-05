import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import crs from 'crypto-random-string';
import type { QueryResult } from "pg";
import { getPool } from "./services/postgreService.js";
import { config } from "./configs/env-config.js";
import type { IAdmin } from "./types/postgresql/IAdmin.js";

export async function createSuperadmin(
    username: string,
    email: string,
    password: string,
) {
    const pool = getPool();

    const candidate: QueryResult<IAdmin> = await pool.query(
        'SELECT * FROM admins WHERE role = $1',
        ['superadmin']
    );
    if (candidate.rows.length > 0) {
        console.log("Superadmin already exist");
        return;
    }

    const adminId = uuidv4();
    const hashedPassword = await bcrypt.hash(password, config.BCRYPT_SALT_ROUNDS);
    const registDate = new Date(Date.now()).toISOString().split("T")[0];
    const adminResult: QueryResult<IAdmin> = await pool.query(
        'INSERT INTO admins (admin_id, username, email, hash_password, role, regist_date, is_deleted) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [adminId, email.split('@')[0], email, hashedPassword, 'superadmin', registDate, false]
    );
    console.log("Superadmin was created");
    return;
}