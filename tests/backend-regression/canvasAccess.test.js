// ============================================================================
// REGRESSION SUITE 2: Canvas CRUD + Participant + Lock API Stability
// Covers: POST /api/canvas, GET /api/canvas/:id, GET /api/canvas/mine,
//         PATCH /api/canvas/:id/name, PATCH /api/canvas/:id/lock,
//         POST /api/canvas/:id/participants, DELETE /api/canvas/:id
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

const makeCanvas = async (token, name = 'Test Canvas') =>
    request(app).post('/api/canvas')
        .set('Authorization', `Bearer ${token}`)
        .send({ name });

describe('Backend Regression: Canvas CRUD API', () => {

    beforeAll(async () => await connect(), 120000);
    afterEach(async () => {
        await clearDatabase();
        jest.clearAllMocks();
    });
    afterAll(async () => await closeDatabase());

    // ── Create ────────────────────────────────────────────────────────────────
    describe('POST /api/canvas', () => {
        it('Regression: creates canvas and returns { canvasId, name, url }', async () => {
            const { token } = await registerAndLogin(app);
            const res = await makeCanvas(token, 'My Board');

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('canvasId');
            expect(res.body.name).toBe('My Board');
            expect(res.body.url).toMatch(/^\/board\/.+/);
        });

        it('Regression: defaults name to "Untitled Board" if not provided', async () => {
            const { token } = await registerAndLogin(app);
            const res = await request(app)
                .post('/api/canvas')
                .set('Authorization', `Bearer ${token}`)
                .send({});

            expect(res.statusCode).toBe(201);
            expect(res.body.name).toBe('Untitled Board');
        });

        it('Regression: returns 401 without auth token', async () => {
            const res = await request(app).post('/api/canvas').send({ name: 'Unauthorized' });
            expect(res.statusCode).toBe(401);
        });
    });

    // ── Read ──────────────────────────────────────────────────────────────────
    describe('GET /api/canvas/:id', () => {
        it('Regression: returns full canvas details', async () => {
            const { token } = await registerAndLogin(app);
            const { body: created } = await makeCanvas(token, 'Detail Board');

            const res = await request(app)
                .get(`/api/canvas/${created.canvasId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.canvasId).toBe(created.canvasId);
            expect(res.body.name).toBe('Detail Board');
            expect(res.body).toHaveProperty('participants');
            expect(res.body).toHaveProperty('is_locked');
            expect(res.body).toHaveProperty('owner');
        });

        it('Regression: returns 404 for non-existent canvas', async () => {
            const { token } = await registerAndLogin(app);
            const res = await request(app)
                .get('/api/canvas/00000000-0000-0000-0000-000000000000')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe('Canvas not found');
        });
    });

    // ── List Mine ─────────────────────────────────────────────────────────────
    describe('GET /api/canvas/mine', () => {
        it('Regression: returns all canvases owned by user', async () => {
            const { token } = await registerAndLogin(app);
            await makeCanvas(token, 'Mine 1');
            await makeCanvas(token, 'Mine 2');

            const res = await request(app)
                .get('/api/canvas/mine')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.canvases).toHaveLength(2);
        });

        it('Regression: returns 401 without token', async () => {
            const res = await request(app).get('/api/canvas/mine');
            expect(res.statusCode).toBe(401);
        });
    });

    // ── Rename ────────────────────────────────────────────────────────────────
    describe('PATCH /api/canvas/:id/name', () => {
        it('Regression: renames canvas successfully', async () => {
            const { token } = await registerAndLogin(app);
            const { body: created } = await makeCanvas(token, 'Old Name');

            const res = await request(app)
                .patch(`/api/canvas/${created.canvasId}/name`)
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'New Name' });

            expect(res.statusCode).toBe(200);
            expect(res.body.name).toBe('New Name');
        });

        it('Regression: returns 400 when name not provided', async () => {
            const { token } = await registerAndLogin(app);
            const { body: created } = await makeCanvas(token);

            const res = await request(app)
                .patch(`/api/canvas/${created.canvasId}/name`)
                .set('Authorization', `Bearer ${token}`)
                .send({});

            expect(res.statusCode).toBe(400);
        });
    });

    // ── Lock ──────────────────────────────────────────────────────────────────
    describe('PATCH /api/canvas/:id/lock', () => {
        it('Regression: owner can lock a canvas', async () => {
            const { token } = await registerAndLogin(app);
            const { body: created } = await makeCanvas(token);

            const res = await request(app)
                .patch(`/api/canvas/${created.canvasId}/lock`)
                .set('Authorization', `Bearer ${token}`)
                .send({ is_locked: true });

            expect(res.statusCode).toBe(200);
            expect(res.body.is_locked).toBe(true);
        });

        it('Regression: returns 400 when is_locked is not boolean', async () => {
            const { token } = await registerAndLogin(app);
            const { body: created } = await makeCanvas(token);

            const res = await request(app)
                .patch(`/api/canvas/${created.canvasId}/lock`)
                .set('Authorization', `Bearer ${token}`)
                .send({ is_locked: 'yes' });

            expect(res.statusCode).toBe(400);
        });
    });

    // ── Delete ────────────────────────────────────────────────────────────────
    describe('DELETE /api/canvas/:id', () => {
        it('Regression: owner can delete canvas, it vanishes from DB', async () => {
            const { token } = await registerAndLogin(app);
            const { body: created } = await makeCanvas(token, 'Delete Me');

            const delRes = await request(app)
                .delete(`/api/canvas/${created.canvasId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(delRes.statusCode).toBe(200);

            const getRes = await request(app)
                .get(`/api/canvas/${created.canvasId}`)
                .set('Authorization', `Bearer ${token}`);
            expect(getRes.statusCode).toBe(404);
        });

        it('Regression: non-owner cannot delete canvases', async () => {
            const owner = await registerAndLogin(app);
            const other = await registerAndLogin(app);
            const { body: created } = await makeCanvas(owner.token, 'Protected');

            const res = await request(app)
                .delete(`/api/canvas/${created.canvasId}`)
                .set('Authorization', `Bearer ${other.token}`);

            expect(res.statusCode).toBe(403);
        });
    });
});
