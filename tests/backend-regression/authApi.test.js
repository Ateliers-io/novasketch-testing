// ============================================================================
// REGRESSION SUITE 1: Auth API Stability
// Covers: POST /api/auth/register, POST /api/auth/login, GET /api/auth/me
// Verifies these critical auth flows haven't regressed across changes.
// ============================================================================

import request from 'supertest';
import { jest } from '@jest/globals';
import { connect, closeDatabase, clearDatabase } from '../helpers/db.js';
import { registerAndLogin } from '../helpers/auth.js';

jest.unstable_mockModule('google-auth-library', () => ({
    OAuth2Client: jest.fn(() => ({
        getToken: jest.fn(),
        verifyIdToken: jest.fn()
    }))
}));

const { default: app } = await import('../../../novasketch-backend/src/app.js');

describe('Backend Regression: Auth API', () => {

    beforeAll(async () => await connect(), 120000);
    afterEach(async () => {
        await clearDatabase();
        jest.clearAllMocks();
    });
    afterAll(async () => await closeDatabase());

    // ── Register ─────────────────────────────────────────────────────────────
    describe('POST /api/auth/register', () => {
        it('Regression: returns 201 with token + user on valid registration', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({ name: 'Test User', email: 'reg@test.com', password: 'Password123!' });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('token');
            expect(res.body).toHaveProperty('user');
            expect(res.body.user).toHaveProperty('email', 'reg@test.com');
        });

        it('Regression: returns 409 on duplicate email', async () => {
            await request(app).post('/api/auth/register')
                .send({ name: 'First', email: 'dup@test.com', password: 'Password123!' });

            const res = await request(app).post('/api/auth/register')
                .send({ name: 'Second', email: 'dup@test.com', password: 'Password123!' });

            expect(res.statusCode).toBe(409);
        });

        it('Regression: returns 400 when required fields are missing', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({ email: 'nofields@test.com' });

            expect(res.statusCode).toBe(400);
        });

        it('Regression: does not accept weak/short passwords', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({ name: 'Bad Pass', email: 'weak@test.com', password: '123' });

            expect(res.statusCode).toBe(400);
        });
    });

    // ── Login ─────────────────────────────────────────────────────────────────
    describe('POST /api/auth/login', () => {
        it('Regression: returns 200 with token on valid credentials', async () => {
            await request(app).post('/api/auth/register')
                .send({ name: 'Login Test', email: 'login@test.com', password: 'Password123!' });

            const res = await request(app).post('/api/auth/login')
                .send({ email: 'login@test.com', password: 'Password123!' });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('token');
        });

        it('Regression: returns 401 on wrong password', async () => {
            await request(app).post('/api/auth/register')
                .send({ name: 'Wrong Pass', email: 'wrongpass@test.com', password: 'Password123!' });

            const res = await request(app).post('/api/auth/login')
                .send({ email: 'wrongpass@test.com', password: 'WrongPassword!' });

            expect(res.statusCode).toBe(401);
        });

        it('Regression: returns 401 on non-existent email', async () => {
            const res = await request(app).post('/api/auth/login')
                .send({ email: 'ghost@test.com', password: 'Password123!' });

            expect(res.statusCode).toBe(401);
        });

        it('Regression: returns 400 when body is empty', async () => {
            const res = await request(app).post('/api/auth/login').send({});
            expect(res.statusCode).toBe(400);
        });
    });

    // ── Get Me ────────────────────────────────────────────────────────────────
    describe('GET /api/auth/me', () => {
        it('Regression: returns 200 with user profile for valid token', async () => {
            const { token } = await registerAndLogin(app);
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('email');
            expect(res.body).toHaveProperty('_id');
        });

        it('Regression: returns 401 without a token', async () => {
            const res = await request(app).get('/api/auth/me');
            expect(res.statusCode).toBe(401);
        });

        it('Regression: returns 401 with a tampered token', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer thisisafaketoken.abc.xyz');
            expect(res.statusCode).toBe(401);
        });
    });
});
