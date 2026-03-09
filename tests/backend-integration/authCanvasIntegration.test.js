// ============================================================================
// IT-01: Auth ↔ Canvas Integration Tests
// ============================================================================
// Verifies the cross-module workflow: Register/Login → Create Canvas → Ownership
// propagation, JWT enforcement, and profile data consistency.
//
// Epics Covered: Epic 1 (Session Management & Access Control), Epic 6 (Data)
// ============================================================================

import { jest } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { connect, closeDatabase, clearDatabase } from '../helpers/db.js';

// Mock Google Auth Library (authController imports it at module level)
jest.unstable_mockModule('google-auth-library', () => ({
    OAuth2Client: jest.fn(() => ({
        getToken: jest.fn(),
        verifyIdToken: jest.fn()
    }))
}));

// Dynamic import after mocks are registered
const { default: app } = await import('../../../novasketch-backend/src/app.js');
const { default: User } = await import('../../../novasketch-backend/src/models/User.js');
const { default: Canvas } = await import('../../../novasketch-backend/src/models/Canvas.js');

beforeAll(async () => await connect(), 120000);
afterEach(async () => {
    await clearDatabase();
    jest.clearAllMocks();
});
afterAll(async () => await closeDatabase());

// ─────────────────────────────────────────────────────────────────────────────
describe('IT-01: Auth ↔ Canvas Integration', () => {

    // ── 1.1 Registration → Canvas Creation → Ownership ──────────────────────
    describe('IT-01-01: Registration → Canvas Creation → Ownership Verification', () => {
        it('should allow a newly registered user to create a canvas and be recorded as owner', async () => {
            // Step 1: Register
            const regRes = await request(app)
                .post('/api/auth/register')
                .send({ name: 'IntegUser', email: 'integ@test.com', password: 'SecurePass1!' });

            expect(regRes.statusCode).toBe(201);
            const token = regRes.body.token;
            const userId = regRes.body.user.id;

            // Step 2: Create canvas
            const canvasRes = await request(app)
                .post('/api/canvas')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Integration Board' });

            expect(canvasRes.statusCode).toBe(201);
            expect(canvasRes.body.name).toBe('Integration Board');
            const canvasId = canvasRes.body.canvasId;

            // Step 3: Verify ownership in DB
            const canvas = await Canvas.findById(canvasId);
            expect(canvas).toBeTruthy();
            expect(canvas.owner.toString()).toBe(userId);
            expect(canvas.participants).toHaveLength(1);
            expect(canvas.participants[0].role).toBe('owner');

            // Step 4: Verify user's canvases array
            const user = await User.findById(userId);
            expect(user.canvases).toHaveLength(1);
            expect(user.canvases[0].canvasId).toBe(canvasId);
            expect(user.canvases[0].role).toBe('owner');
        });
    });

    // ── 1.2 Login → Access Protected Canvas Routes ──────────────────────────
    describe('IT-01-02: Login → Access /api/canvas/mine', () => {
        it('should return the user canvas list after login', async () => {
            // Register & create canvas
            const regRes = await request(app)
                .post('/api/auth/register')
                .send({ name: 'LoginUser', email: 'logincanvas@test.com', password: 'StrongPass1!' });
            const regToken = regRes.body.token;

            await request(app)
                .post('/api/canvas')
                .set('Authorization', `Bearer ${regToken}`)
                .send({ name: 'My Board' });

            // Login with credentials
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({ email: 'logincanvas@test.com', password: 'StrongPass1!' });

            expect(loginRes.statusCode).toBe(200);

            // Access canvas list with login token
            const mineRes = await request(app)
                .get('/api/canvas/mine')
                .set('Authorization', `Bearer ${loginRes.body.token}`);

            expect(mineRes.statusCode).toBe(200);
            expect(mineRes.body.canvases).toHaveLength(1);
            expect(mineRes.body.canvases[0].name).toBe('My Board');
            expect(mineRes.body.canvases[0].role).toBe('owner');
        });
    });

    // ── 1.3 Token Expiry/Tamper → Rejection ─────────────────────────────────
    describe('IT-01-03: Expired/Invalid Token → Canvas Route Rejection', () => {
        it('should reject canvas creation with an expired JWT', async () => {
            const user = await User.create({
                displayName: 'ExpiredUser',
                email: 'expired@test.com',
                password: 'Password1!',
                authProvider: 'local'
            });
            const expiredToken = jwt.sign(
                { userId: user._id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: '0s' }
            );
            await new Promise(r => setTimeout(r, 100));

            const res = await request(app)
                .post('/api/canvas')
                .set('Authorization', `Bearer ${expiredToken}`)
                .send({ name: 'Should Fail' });

            expect(res.statusCode).toBe(401);
        });

        it('should reject canvas creation with a tampered token', async () => {
            const tampered = jwt.sign(
                { userId: 'fake-id', email: 'fake@test.com' },
                'wrong-secret',
                { expiresIn: '1h' }
            );

            const res = await request(app)
                .post('/api/canvas')
                .set('Authorization', `Bearer ${tampered}`)
                .send({ name: 'Should Fail' });

            expect(res.statusCode).toBe(401);
        });
    });

    // ── 1.4 /me Returns Canvas References ───────────────────────────────────
    describe('IT-01-04: /me Endpoint Includes Canvas References', () => {
        it('should return user profile with canvases array populated', async () => {
            const regRes = await request(app)
                .post('/api/auth/register')
                .send({ name: 'ProfileUser', email: 'profile@test.com', password: 'MyPass123!' });
            const token = regRes.body.token;

            await request(app).post('/api/canvas').set('Authorization', `Bearer ${token}`).send({ name: 'Board 1' });
            await request(app).post('/api/canvas').set('Authorization', `Bearer ${token}`).send({ name: 'Board 2' });

            const meRes = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${token}`);

            expect(meRes.statusCode).toBe(200);
            expect(meRes.body.email).toBe('profile@test.com');
            expect(meRes.body.canvases).toHaveLength(2);
        });
    });

    // ── 1.5 Canvas Details Populate Owner ───────────────────────────────────
    describe('IT-01-05: Canvas Details Return Populated Owner', () => {
        it('should return owner displayName when fetching canvas details', async () => {
            const regRes = await request(app)
                .post('/api/auth/register')
                .send({ name: 'DetailUser', email: 'detail@test.com', password: 'Passw0rd!' });
            const token = regRes.body.token;

            const createRes = await request(app)
                .post('/api/canvas')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Detailed Board' });
            const canvasId = createRes.body.canvasId;

            const detailRes = await request(app).get(`/api/canvas/${canvasId}`);

            expect(detailRes.statusCode).toBe(200);
            expect(detailRes.body.canvasId).toBe(canvasId);
            expect(detailRes.body.name).toBe('Detailed Board');
            expect(detailRes.body.owner).toHaveProperty('displayName', 'DetailUser');
            expect(detailRes.body.is_locked).toBe(false);
            expect(detailRes.body.participants).toHaveLength(1);
        });
    });
});
