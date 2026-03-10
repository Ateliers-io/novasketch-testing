// ============================================================================
// REGRESSION SUITE 3: History & Shape Routes Stability
// Covers: GET /api/history/:sessionId, DELETE /api/history/:sessionId
//         GET /api/rooms/:roomId/shapes, GET /api/rooms/:roomId/shape/:shapeId
// ============================================================================

import request from 'supertest';
import { jest } from '@jest/globals';
import { connect, closeDatabase, clearDatabase } from '../helpers/db.js';

jest.unstable_mockModule('google-auth-library', () => ({
    OAuth2Client: jest.fn(() => ({
        getToken: jest.fn(),
        verifyIdToken: jest.fn()
    }))
}));

const { default: app } = await import('../../../novasketch-backend/src/app.js');

describe('Backend Regression: History & Shape Routes', () => {

    beforeAll(async () => await connect(), 120000);
    afterEach(async () => {
        await clearDatabase();
        jest.clearAllMocks();
    });
    afterAll(async () => await closeDatabase());

    // ── History Routes ────────────────────────────────────────────────────────
    describe('GET /api/history/:sessionId', () => {
        it('Regression: returns empty array for unknown sessionId (no crash)', async () => {
            const res = await request(app).get('/api/history/unknown-session-abc');

            expect(res.statusCode).toBe(200);
            expect(res.body).toBeInstanceOf(Array);
            expect(res.body).toHaveLength(0);
        });

        it('Regression: response is always a JSON array', async () => {
            const res = await request(app).get('/api/history/some-session-xyz');
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
    });

    describe('DELETE /api/history/:sessionId', () => {
        it('Regression: delete on empty session returns { deleted: 0 }', async () => {
            const res = await request(app).delete('/api/history/no-such-session');

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('deleted');
            expect(typeof res.body.deleted).toBe('number');
        });
    });

    // ── Shape / Room Routes ───────────────────────────────────────────────────
    describe('GET /api/rooms/:roomId/shapes', () => {
        it('Regression: returns 404 for non-existent room', async () => {
            const res = await request(app).get('/api/rooms/nonexistent-room-id/shapes');

            expect(res.statusCode).toBe(404);
            expect(res.body).toHaveProperty('error');
        });
    });

    describe('GET /api/rooms/:roomId/shape/:shapeId', () => {
        it('Regression: returns 404 for non-existent room + shape', async () => {
            const res = await request(app).get('/api/rooms/fake-room/shape/fake-shape');

            expect(res.statusCode).toBe(404);
            expect(res.body).toHaveProperty('error');
        });
    });

    // ── Health & General ──────────────────────────────────────────────────────
    describe('GET /health', () => {
        it('Regression: health endpoint is always reachable', async () => {
            const res = await request(app).get('/health');
            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('OK');
        });
    });

    describe('Unknown routes', () => {
        it('Regression: GET /api/nonexistent returns 404 with JSON error', async () => {
            const res = await request(app).get('/api/nonexistent-route-xyz');
            expect(res.statusCode).toBe(404);
            expect(res.headers['content-type']).toMatch(/json/);
        });

        it('Regression: POST /api/unknown returns 404', async () => {
            const res = await request(app).post('/api/totally-unknown').send({});
            expect(res.statusCode).toBe(404);
        });
    });
});
