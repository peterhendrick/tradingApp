import { Pool } from 'pg';
import { config } from './config';
const pool = new Pool(config);

function initializeDatabaseTables() {
    return Promise.all([
        pool.query(`CREATE TABLE IF NOT EXISTS users (
            id  uuid   PRIMARY KEY,
            username    text,
            password    text
        );`),
        pool.query(`CREATE TABLE IF NOT EXISTS rates (
            id  int   PRIMARY KEY,
            xmr    text,
            ltc    text,
            salt    text,
            doge    text,
            usd    text
        );`),
        pool.query(`CREATE TABLE IF NOT EXISTS balances (
            userid  uuid   PRIMARY KEY,
            btc    text,
            xmr    text,
            ltc    text,
            salt    text,
            doge    text,
            usd    text
        );`)
    ]);
}

export const db = {
    initializeDatabaseTables
};
