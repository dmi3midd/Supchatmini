import dotenv from "dotenv";
dotenv.config();

function required(key: string): string {
    const v = process.env[key];
    if (!v) throw new Error(`Missing required env var: ${key}`);
    return v;
}

export const config = {
    PORT: Number(process.env.PORT ?? 3000),
    WSS_PORT: Number(process.env.WSS_PORT ?? 8080),
    CLIENT_URL: process.env.CLIENT_URL ?? "http://localhost:3000",

    DB: {
        HOST: required("DB_HOST"),
        PORT: Number(required("DB_PORT")),
        USER: required("DB_USER"),
        PASSWORD: required("DB_PASSWORD"),
        NAME: required("DB_NAME"),
    },

    BCRYPT_SALT_ROUNDS: Number(process.env.BCRYPT_SALT_ROUNDS ?? 10),

    CRYPTO_SECRET_KEY: required("CRYPTO_SECRET_KEY"),

    JWT: {
        ACCESS_SECRET: required("JWT_ACCESS_SECRET"),
        REFRESH_SECRET: required("JWT_REFRESH_SECRET"),
        ACCESS_EXPIRATION: required("JWT_ACCESS_EXPIRATION"),
        REFRESH_EXPIRATION: required("JWT_REFRESH_EXPIRATION"),
    },

    EMAIL: {
        HOST: required("EMAIL_HOST"),
        PORT: Number(required("EMAIL_PORT")),
        USER: required("EMAIL_USER"),
        PASSWORD: required("EMAIL_PASSWORD"),
    }
};