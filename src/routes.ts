import { Pool } from 'pg';
import { config } from './config';
import { Request, Response } from 'express';
const pool = new Pool(config);

const home = async (request: Request, response: Response) => {
    response.json({ info: 'Node.js, Express, and Postgres API' });
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
    const { name, email } = request.body;

    try {
        const results = await pool.query('INSERT INTO users (name, email) VALUES ($1, $2)', [name, email])
        response.status(201).send(`User added with ID: ${results.insertId}`);
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

export const routes = {
    createUser,
    deleteUser,
    getUserById,
    getUsers,
    home,
    updateUser
};
