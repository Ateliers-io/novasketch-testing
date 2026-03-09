// ============================================================================
// IT-06: Health & 404 Error Handling Integration Tests
// ============================================================================
// Tests infrastructure-level integration: health endpoint, 404 fallbacks,
// and API error responses for unknown routes.
//
// Epics Covered: Cross-cutting (API reliability, error handling)
// ============================================================================

import { jest } from '@jest/globals';
import request from 'supertest';
import { connect, closeDatabase, clearDatabase } from '../helpers/db.js';

jest.unstable_mockModule('google-auth-library', () => ({
    OAuth2Client: jest.fn(() => ({
        getToken: jest.fn(),
        verifyIdToken: jest.fn()
    }))
}));

const { default: app } = await import('../../../novasketch-backend/src/app.js');

beforeAll(async () => await connect(), 120000);
afterEach(async () => {
    await clearDatabase();
    jest.clearAllMocks();
});
afterAll(async () => await closeDatabase());

// ─────────────────────────────────────────────────────────────────────────────
describe('IT-06: Health & Error Handling', () => {

    // ── 6.1 Health Endpoint ─────────────────────────────────────────────────
    describe('IT-06-01: GET /health', () => {
        it('should return 200 with { status: "OK" }', async () => {
            const res = await request(app).get('/health');
            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual({ status: 'OK' });
        });
    });

    // ── 6.2 Root Endpoint ───────────────────────────────────────────────────
    describe('IT-06-02: GET /', () => {
        it('should return a welcome message', async () => {
            const res = await request(app).get('/');
            expect(res.statusCode).toBe(200);
            expect(res.text).toContain('Drawing Backend Running');
        });
    });

    // ── 6.3 404 for Unknown API Routes ──────────────────────────────────────
    describe('IT-06-03: 404 for Unknown Routes', () => {
        it('should return 404 for GET /api/nonexistent', async () => {
            const res = await request(app).get('/api/nonexistent');
            expect(res.statusCode).toBe(404);
        });

        it('should return 404 for POST /api/unknown', async () => {
            const res = await request(app).post('/api/unknown').send({});
            expect(res.statusCode).toBe(404);
        });

        it('should return JSON error body for 404', async () => {
            const res = await request(app).get('/api/totally-missing');
            expect(res.statusCode).toBe(404);
            expect(res.body).toHaveProperty('error');
        });
    });

    // ── 6.4 Missing Auth on Protected Routes ────────────────────────────────
    describe('IT-06-04: Missing Auth on Protected Routes', () => {
        it('should return 401 for POST /api/canvas without auth', async () => {
            const res = await request(app)
                .post('/api/canvas')
                .send({ name: 'No Auth' });
            expect(res.statusCode).toBe(401);
        });

        it('should return 401 for GET /api/canvas/mine without auth', async () => {
            const res = await request(app).get('/api/canvas/mine');
            expect(res.statusCode).toBe(401);
        });

        it('should return 401 for GET /api/auth/me without auth', async () => {
            const res = await request(app).get('/api/auth/me');
            expect(res.statusCode).toBe(401);
        });
    });

    // ── 6.5 Content-Type Enforcement ────────────────────────────────────────
    describe('IT-06-05: API Returns JSON', () => {
        it('should return application/json for health endpoint', async () => {
            const res = await request(app).get('/health');
            expect(res.headers['content-type']).toMatch(/json/);
        });

        it('should return application/json for canvas GET', async () => {
            const res = await request(app).get('/api/canvas/nonexistent-id');
            expect(res.headers['content-type']).toMatch(/json/);
        });
    });
});
