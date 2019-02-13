import { Request, Response } from 'express';
import { Pool } from 'pg';
import * as request from 'request-promise';
import { config } from './config';
const pool = new Pool(config);

_getTickerAndSaveRates();
setInterval(_getTickerAndSaveRates, 60000);

const getRates = async (req: Request, res: Response) => {
    const rates = await pool.query('SELECT * FROM rates ORDER BY id ASC')
        .then(_handleDBResults);
    res.json({ok: true, text: rates});
};

const createUser = async (req: Request, res: Response) => {
    const { username, hashedPassword } = req.body;
    if (!username || !hashedPassword) return res.status(400)
        .send(`${!username ? 'Username required ' : ''}${!hashedPassword ? 'Password Required' : ''}`);
    if (hashedPassword.length !== 64) return res.status(400).json({message: `Invalid password: Must be a sha 256 hash.`});
    try {
        const existingUserCheck = await pool.query('SELECT * FROM users WHERE username = $1', [username.toLowerCase()]);
        if (existingUserCheck.rowCount) return res.status(400).json({message: `User username is taken`});
        await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username.toLowerCase(), hashedPassword]);
        const idResponse = await pool.query('SELECT id FROM users WHERE username = $1', [username.toLowerCase()]);
        const userId = idResponse.rows[0].id;
        await pool.query('INSERT INTO balances (btc, xmr, ltc, doge, salt, usd, userid) VALUES (0, 0, 0, 0, 0, 10000, $1)',
        [userId]);
        res.status(201).json({ok: true, text: `User ${username.toLowerCase()} added successfully. You can now login.`});
    } catch (error) {
        throw error;
    }
};

const authenticateUser = async (req: Request, res: Response) => {
    const { username, hashedPassword } = req.body;
    const user = await pool.query('SELECT * FROM users FULL OUTER JOIN balances ON users.id = balances.userid WHERE username = $1', [username.toLowerCase()])
        .then(_handleDBResults);
    if (user === '404' || user.password !== hashedPassword)
        return res.status(404).json({message: 'Username or password is incorrect'});
    const responseJson = {
        balances: {xmr: user.xmr, btc: user.btc, ltc: user.ltc, salt: user.salt, doge: user.doge, usd: user.usd},
        id: user.id,
        token: 'fake-jwt-token',
        username: user.username
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

const buyBtc = async (req: Request, res: Response) => {
    const { id, pair, amount } = req.body;
    try {
        const [userBalances, rates] = await Promise.all([
            pool.query('SELECT * FROM balances WHERE userid = $1', [id]),
            pool.query('SELECT * FROM rates WHERE id = 1')
        ])
        .then((data) => [_handleDBResults(data[0]), _handleDBResults(data[1])]);
        const pairBalance = Number(userBalances[pair]);
        const pairTradeAmount = Number(amount) * Number(rates[pair]);
        const btcBalance = Number(userBalances.btc);
        if (pairBalance >= pairTradeAmount) {
            const pairAmount = pairBalance - pairTradeAmount;
            const btcAmount = btcBalance + amount;
            await pool.query(`UPDATE balances SET ${pair} = ${pairAmount.toString()}, btc = ${btcAmount.toString()} WHERE userid = ${id}`);
            res.status(200).json({ok: true, text: 'Trade Successful'});
        } else {
            res.status(400).json({ok: true, text: ''});
        }
    } catch (error) {
        throw error;
    }
};

const sellBtc = async (req: Request, res: Response) => {
    const { id, pair, amount } = req.body;
    try {
        const [userBalances, rates] = await Promise.all([
            pool.query('SELECT * FROM balances WHERE userid = $1', [id]),
            pool.query('SELECT * FROM rates WHERE id = 1')
        ])
        .then((data) => [_handleDBResults(data[0]), _handleDBResults(data[1])]);
        const pairBalance = Number(userBalances[pair]);
        const pairTradeAmount = Number(amount) * Number(rates[pair]);
        const btcBalance = Number(userBalances.btc);
        if (btcBalance >= Number(amount)) {
            const pairAmount = pairBalance + pairTradeAmount;
            const btcAmount = btcBalance - amount;
            await pool.query(`UPDATE balances SET ${pair} = ${pairAmount.toString()}, btc = ${btcAmount.toString()} WHERE userid = ${id}`);
            res.status(200).json({ok: true, text: 'Trade Successful'});
        } else {
            res.status(400).json({ok: true, text: ''});
        }
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

        const saveResults = await _saveRates(xmrRate, ltcRate, dogeRate, saltRate, usdRate);
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
}

export const routes = {
    authenticateUser,
    buyBtc,
    createUser,
    getRates,
    sellBtc
};
