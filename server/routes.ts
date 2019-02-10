import { Request, Response } from 'express';
import { Pool } from 'pg';
import * as request from 'request-promise';
import { config } from './config';
const pool = new Pool(config);

_getTickerAndSaveRates();
setInterval(_getTickerAndSaveRates, 60000);

const home = async (req: Request, res: Response) => {
    const rates = await _getDatabaseRates();
    res.json(rates);
};

const getUserById = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);

    try {
        const results = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        res.status(200).json(results.rows.find((row: any) => row.id === id));
    } catch (error) {
        throw error;
    }
};

const getUsers = async (req: Request, res: Response) => {
    try {
        const results = await pool.query('SELECT * FROM users ORDER BY id ASC');
        res.status(200).json(results.rows);
    } catch (error) {
        throw error;
    }
};

const createUser = async (req: Request, res: Response) => {
    const { email, hashedPassword } = req.body;
    if (!email || !hashedPassword) return res.status(400)
        .send(`${!email ? 'Email required ' : ''}${!hashedPassword ? 'Password Required' : ''}`);
    if (hashedPassword.length !== 64) return res.status(400).json({message: `Invalid password: Must be a sha 256 hash.`});

    try {
        const existingUserCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUserCheck.rowCount) return res.status(400).json({message: `User email is taken`});
        await pool.query('INSERT INTO users (email, password) VALUES ($1, $2)', [email, hashedPassword]);
        const idResponse = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        const userId = idResponse.rows[0].id;
        await pool.query('INSERT INTO balances (btc, xmr, ltc, doge, salt, usd, userid) VALUES (0, 0, 0, 0, 0, 10000, $1)',
        [userId]);
        res.status(201).json({ok: true, text: `User ${email} added successfully`});
    } catch (error) {
        throw error;
    }
};

const updateUser = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const { name, email, password } = req.body;

    try {
        const results = await pool.query('UPDATE users SET name = $1, email = $2 WHERE id = $3', [name, email, id])
        res.status(200).send(`User modified with ID: ${id}`);
    } catch (error) {
        throw error;
    }
};

const deleteUser = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);

    try {
        const results = await pool.query('DELETE FROM users WHERE id = $1', [id]);
        res.status(200).send(`User deleted with ID: ${id}`);
    } catch (error) {
        throw error;
    }
};

const authenticateUser = async (req: Request, res: Response) => {
    const { email, hashedPassword } = req.body;
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email])
        .then(_handleDBResults);
    if (user === '404' || user.password !== hashedPassword)
        return res.status(404).json({message: 'Username or password is incorrect'});
    const responseJson = {
        email: user.email,
        id: user.id,
        token: 'fake-jwt-token'
    };
    const response = { ok: true, text: responseJson };
    res.status(200).json(response);
};

function _handleDBResults(results) {
    if (results.rowCount) {
        return results.rowCount === 1 ? results.rows[0] : results.rows;
    }
    return '404';
}

const buyBTC = async (req: Request, res: Response) => {
    const { userId, amount } = req.body;
    const [usdBalance, usdRate] = await Promise.all([
        pool.query('SELECT usd FROM balances WHERE userid = $1', [userId]),
        pool.query('SELECT usd FROM rates WHERE id = 1')
    ]);

    console.log();

};

const sellBTC = async (req: Request, res: Response) => {
    const { userId, amount } = req.body;
};

const tradeBtc = async (req: Request, res: Response) => {
    const { userId, alt, amount } = req.body;

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

        const saveResults = await _saveRates(xmrRate, ltcRate, dogeRate, saltRate, usdRate);

        console.log();
    } catch (error) {
        throw error;
    }
}

async function _saveRates(xmrRate, ltcRate, dogeRate, saltRate, usdRate) {
    const ratesResponse = await pool.query('SELECT * FROM rates ORDER BY id ASC');
    const insertCheck = !(ratesResponse && ratesResponse.rowCount);
    if (insertCheck) {
        return await pool.query('INSERT INTO rates (xmr, ltc, doge, salt, usd, id) VALUES ($1, $2, $3, $4, $5, 1)',
        [xmrRate, ltcRate, dogeRate, saltRate, usdRate]);
    }
    const currentRates = ratesResponse.rows[0];
    xmrRate = xmrRate ? xmrRate : currentRates.xmr;
    ltcRate = ltcRate ? ltcRate : currentRates.ltc;
    dogeRate = dogeRate ? dogeRate : currentRates.doge;
    saltRate = saltRate ? saltRate : currentRates.salt;
    usdRate = usdRate ? usdRate : currentRates.usd;

    return await pool.query('UPDATE rates SET xmr = $1, ltc = $2, doge = $3, salt = $4, usd = $5 WHERE id = 1',
    [xmrRate, ltcRate, dogeRate, saltRate, usdRate]);
    console.log();
}

async function _getDatabaseRates() {
    const ratesResponse = await pool.query('SELECT * FROM rates ORDER BY id ASC');
    return ratesResponse.rows[0];
}

export const routes = {
    authenticateUser,
    createUser,
    deleteUser,
    getUserById,
    getUsers,
    home,
    updateUser
};
