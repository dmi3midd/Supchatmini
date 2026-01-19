interface ProcessEnv {
    // server
    PORT: string;
    WSS_PORT: string;
    CLIENT_URL: string;

    // postgreSQL
    DB_HOST: string;
    DB_PORT: string;
    DB_USER: string;
    DB_PASSWORD: string;
    DB_NAME: string;

    // bcrypt
    BCRYPT_SALT_ROUNDS: string; 

    // crypto
    CRYPTO_SECRET_KEY: string;

    // jwt
    JWT_ACCESS_SECRET: string;
    JWT_REFRESH_SECRET: string;
    JWT_ACCESS_EXPIRATION: string;
    JWT_REFRESH_EXPIRATION: string;

    // email
    EMAIL_HOST: string;
    EMAIL_PORT: string;
    EMAIL_USER: string;
    EMAIL_PASSWORD: string;
}

declare namespace NodeJS {
    interface ProcessEnv extends ProcessEnv { }
}