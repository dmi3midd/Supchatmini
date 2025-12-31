import jwt, { type JwtPayload, type SignOptions } from 'jsonwebtoken';
import type { QueryResult } from 'pg';
import { config } from '../configs/env-config.js';
import { getPool } from './postgreService.js';
import type { IToken } from '../types/postgresql/IToken.js';
import type { ITokens } from '../types/IToknes.js';


const JWT_ACCESS_SECRET = config.JWT.ACCESS_SECRET;
const JWT_REFRESH_SECRET = config.JWT.REFRESH_SECRET;
const JWT_ACCESS_EXPIRATION = config.JWT.ACCESS_EXPIRATION;
const JWT_REFRESH_EXPIRATION = config.JWT.REFRESH_EXPIRATION;


class TokenService {
    generateTokens(payload: object): ITokens {
        const accessToken = jwt.sign(
            payload,
            JWT_ACCESS_SECRET,
            { expiresIn: JWT_ACCESS_EXPIRATION } as SignOptions // Type assertion (need to refactor later)
        );

        const refreshToken = jwt.sign(
            payload,
            JWT_REFRESH_SECRET,
            { expiresIn: JWT_REFRESH_EXPIRATION } as SignOptions // Type assertion (need to refactor later)
        );

        return {
            accessToken,
            refreshToken,
        }
    }

    validateAccessToken(token: string): string | JwtPayload | null {
        try {
            const userData = jwt.verify(token, JWT_ACCESS_SECRET);
            return userData as string | JwtPayload; // Type assertion (need to refactor later)
        } catch (error) {
            return null;
        }
    }

    validateRefreshToken(token: string): string | JwtPayload | null {
        try {
            const userData = jwt.verify(token, JWT_REFRESH_SECRET);
            return userData as string | JwtPayload; // Type assertion (need to refactor later)
        } catch (error) {
            return null;
        }
    }

    async findToken(refreshToken: string): Promise<IToken | undefined> {
        const pool = getPool();
        const result: QueryResult<IToken> = await pool.query(
            'SELECT * FROM tokens WHERE token = $1',
            [refreshToken]
        );
        return result.rows[0];
    }

    async saveToken(admin_id: string, refreshToken: string): Promise<IToken | undefined> {
        const pool = getPool();
        const result: QueryResult<IToken> = await pool.query(
            'SELECT * FROM tokens WHERE admin_id = $1',
            [admin_id]
        );

        if (result.rows.length > 0) {
            const updatedToken: QueryResult<IToken> = await pool.query(
                'UPDATE tokens SET token = $1 WHERE admin_id = $2 RETURNING *',
                [refreshToken, admin_id]
            );
            return updatedToken.rows[0];
        }
        const newResult: QueryResult<IToken> = await pool.query(
            'INSERT INTO tokens (admin_id, token) VALUES ($1, $2) RETURNING *',
            [admin_id, refreshToken]
        );
        return newResult.rows[0];
    }

    async removeToken(refreshToken: string): Promise<IToken | undefined> {
        const pool = getPool();
        const tokenResult: QueryResult<IToken> = await pool.query(
            'DELETE FROM tokens WHERE token = $1 RETURNING *',
            [refreshToken]
        );
        return tokenResult.rows[0];
    }
}

export default new TokenService();