import { Pool } from 'pg';
import { config } from './config';
import { Request, Response } from 'express';
import * as request from 'request-promise';
const pool = new Pool(config);

_getTickerAndSaveRates();
setInterval(_getTickerAndSaveRates, 60000);

const home = async (request: Request, response: Response) => {
    const rates = await _getDatabaseRates();
    response.json(rates);
};

const getUserById = async (request: Request, response: Response) => {
    const id = parseInt(request.params.id, 10);

    try {
        const results = await pool.query('SELECT * FROM users WHERE id = $1', [id])
        response.status(200).json(results.rows.find(row => row.id === id));
    } catch (error) {
        throw error;
    }
};

const getUsers = async (request: Request, response: Response) => {
    try {
        const results = await pool.query('SELECT * FROM users ORDER BY id ASC')
        response.status(200).json(results.rows);
    } catch (error) {
        throw error;
    }
};

const createUser = async (request: Request, response: Response) => {
    const { name, email, password } = request.body;
    if (!email || !password) return response.status(400).send(`${!email ? 'Email required ' : ''}${!password ? 'Password Required' : ''}`);
    if (password.length !== 64) return response.status(400).send(`Invalid password: Must be a sha 256 hash.`);

    try {
        const existingUserCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUserCheck.rowCount) return response.status(400).send(`User email is taken`);
        const results = await pool.query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3)', [name, email, password])
        const idResponse = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        const userId = idResponse.rows[0].id;
        await pool.query('INSERT INTO balances (xmr, ltc, doge, salt, usd, userid) VALUES (0, 0, 0, 0, 10000, $1)', [userId]);
        response.status(201).send(`User added with id: ${userId}`);
    } catch (error) {
        throw error;
    }
};

const updateUser = async (request: Request, response: Response) => {
    const id = parseInt(request.params.id, 10);
    const { name, email } = request.body;

    try {
        const results = await pool.query('UPDATE users SET name = $1, email = $2 WHERE id = $3', [name, email, id])
        response.status(200).send(`User modified with ID: ${id}`);
    } catch (error) {
        throw error;
    }
};

const deleteUser = async (request: Request, response: Response) => {
    const id = parseInt(request.params.id, 10);

    try {
        const results = await pool.query('DELETE FROM users WHERE id = $1', [id])
        response.status(200).send(`User deleted with ID: ${id}`);
    } catch (error) {
        throw error;
    }
};

async function _getTickerAndSaveRates() {
    try {
        const [xmrRes, ltcRes, dogeRes, saltRes, usdRes] = await Promise.all([
            request('https://www.ShapeShift.io/rate/btc_xmr'),
            request('https://www.ShapeShift.io/rate/btc_ltc'),
            request('https://www.ShapeShift.io/rate/btc_doge'),
            request('https://www.ShapeShift.io/rate/btc_salt'),
            request('https://api.coinbase.com/v2/prices/spot?currency=USD')
        ]);
        const xmrRate = !xmrRes || JSON.parse(xmrRes).error ? null : JSON.parse(xmrRes).rate;
        const ltcRate = !ltcRes || JSON.parse(ltcRes).error ? null : JSON.parse(ltcRes).rate;
        const dogeRate = !dogeRes || JSON.parse(dogeRes).error ? null : JSON.parse(dogeRes).rate;
        const saltRate = !saltRes || JSON.parse(saltRes).error ? null : JSON.parse(saltRes).rate;
        const usdRate = !usdRes || JSON.parse(usdRes).error ? null : JSON.parse(usdRes).data.amount;

        let saveResults = await _saveRates(xmrRate, ltcRate, dogeRate, saltRate, usdRate);

        console.log();
    } catch (error) {
        throw error;
    }
}

async function _saveRates(xmrRate, ltcRate, dogeRate, saltRate, usdRate) {
    const ratesResponse = await pool.query('SELECT * FROM rates ORDER BY id ASC');
    const insertCheck = !(ratesResponse && ratesResponse.rowCount);
    if (insertCheck) return await pool.query('INSERT INTO rates (xmr, ltc, doge, salt, usd, id) VALUES ($1, $2, $3, $4, $5, 1)', [xmrRate, ltcRate, dogeRate, saltRate, usdRate]);
    const currentRates = ratesResponse.rows[0];
    xmrRate = xmrRate ? xmrRate : currentRates.xmr;
    ltcRate = ltcRate ? ltcRate : currentRates.ltc;
    dogeRate = dogeRate ? dogeRate : currentRates.doge;
    saltRate = saltRate ? saltRate : currentRates.salt;
    usdRate = usdRate ? usdRate : currentRates.usd;

    return await pool.query('UPDATE rates SET xmr = $1, ltc = $2, doge = $3, salt = $4, usd = $5 WHERE id = 1', [xmrRate, ltcRate, dogeRate, saltRate, usdRate]);
    console.log();
}

async function _getDatabaseRates() {
    const ratesResponse = await pool.query('SELECT * FROM rates ORDER BY id ASC');
    return ratesResponse.rows[0];
}

export const routes = {
    createUser,
    deleteUser,
    getUserById,
    getUsers,
    home,
    updateUser
};
