// tests/helpers/auth.js — Authentication test helper utilities.
//
// Provides reusable functions for creating users and generating JWTs
// in integration tests. Uses the backend API via supertest.

import request from 'supertest';
import jwt from 'jsonwebtoken';

let counter = 0;

/**
 * Register a new user via POST /api/auth/register and return token + profile.
 * Generates a unique email on every call for test isolation.
 *
 * @param {import('express').Application} app
 * @param {Partial<{ name: string, email: string, password: string }>} [overrides]
 * @returns {Promise<{ token: string, userId: string, user: object }>}
 */
export const registerAndLogin = async (app, overrides = {}) => {
    const id = ++counter;
    const defaults = {
        name: `TestUser${id}`,
        email: `testuser${id}_${Date.now()}@integration.test`,
        password: 'Password123!',
    };
    const userData = { ...defaults, ...overrides };

    const res = await request(app)
        .post('/api/auth/register')
        .send(userData);

    if (res.statusCode !== 201) {
        throw new Error(
            `registerAndLogin failed (${res.statusCode}): ${JSON.stringify(res.body)}`
        );
    }

    return {
        token: res.body.token,
        userId: res.body.user.id,
        user: res.body.user,
    };
};

/**
 * Login an existing user via POST /api/auth/login.
 *
 * @param {import('express').Application} app
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ token: string, userId: string, user: object }>}
 */
export const loginUser = async (app, credentials) => {
    const res = await request(app)
        .post('/api/auth/login')
        .send(credentials);

    if (res.statusCode !== 200) {
        throw new Error(
            `loginUser failed (${res.statusCode}): ${JSON.stringify(res.body)}`
        );
    }

    return {
        token: res.body.token,
        userId: res.body.user.id,
        user: res.body.user,
    };
};

/**
 * Create a JWT manually (bypasses API — useful for testing expired/tampered tokens).
 *
 * @param {{ userId: string, email: string }} payload
 * @param {{ expiresIn?: string, secret?: string }} [options]
 * @returns {string}
 */
export const createToken = (payload, options = {}) => {
    const secret = options.secret || process.env.JWT_SECRET;
    const expiresIn = options.expiresIn || '1h';
    return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Returns Authorization header object for supertest's .set().
 * @param {string} token
 * @returns {{ Authorization: string }}
 */
export const authHeader = (token) => ({ Authorization: `Bearer ${token}` });
