import { Pool } from 'pg';
import { config } from '../configs/env-config.js';

let pool: Pool;

export function initPostgre() {
    pool = new Pool({
        user: config.DB.USER,
        host: config.DB.HOST,
        database: config.DB.NAME,
        password: config.DB.PASSWORD,
        port: config.DB.PORT,
    });
    pool.on("error", (err) => {
        console.error("PostgreSQL error:", err);
    });
    console.log("Postgre is connected");
}

export function getPool(): Pool {
    if (!pool) {
        throw new Error("PostgreSQL pool has not been initialized. Call initPostgre() first.");
    }
    return pool;
}