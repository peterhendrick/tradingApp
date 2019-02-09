import { localConfig } from './local-config';

export const config = localConfig ? localConfig : {
    database: process.env.DB,
    host: process.env.HOST,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
    user: process.env.DB_USER
};
