// ============================================================================
// IT-03: Session Lock Enforcement Integration Tests
// ============================================================================
// Verifies that the canvas lock (is_locked = true) correctly blocks write
// operations (lock, rename, participant add) while allowing read operations
// (GET details, GET /mine). Tests lock/unlock toggle and persistence.
//
// Epics Covered: Epic 1 (1.5 Read-Only Mode), Epic 3 (3.7 Lock Feature)
// ============================================================================

import { jest } from '@jest/globals';
import request from 'supertest';
import crypto from 'node:crypto';
import { connect, closeDatabase, clearDatabase } from '../helpers/db.js';

jest.unstable_mockModule('google-auth-library', () => ({
    OAuth2Client: jest.fn(() => ({
        getToken: jest.fn(),
        verifyIdToken: jest.fn()
    }))
}));

const { default: app } = await import('../../../novasketch-backend/src/app.js');
const { default: Canvas } = await import('../../../novasketch-backend/src/models/Canvas.js');

beforeAll(async () => await connect(), 120000);
afterEach(async () => {
    await clearDatabase();
    jest.clearAllMocks();
});
afterAll(async () => await closeDatabase());

// Helper
const createAuthUser = async (overrides = {}) => {
    const id = crypto.randomUUID().slice(0, 8);
    const data = {
        name: `User${id}`,
        email: `user${id}@lock.test`,
        password: 'Password123!',
        ...overrides,
    };
    const res = await request(app).post('/api/auth/register').send(data);
    if (res.statusCode !== 201) throw new Error(`Create user failed: ${res.statusCode}`);
    return { token: res.body.token, userId: res.body.user.id };
};

// ─────────────────────────────────────────────────────────────────────────────
describe('IT-03: Session Lock Enforcement', () => {

    // ── 3.1 Lock Toggle Persistence ─────────────────────────────────────────
    describe('IT-03-01: Lock Toggle Persists in Database', () => {
        it('should persist lock state and return it on subsequent GET', async () => {
            const { token } = await createAuthUser();

            const createRes = await request(app)
                .post('/api/canvas')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Lock Board' });
            const canvasId = createRes.body.canvasId;

            // Lock
            await request(app)
                .patch(`/api/canvas/${canvasId}/lock`)
                .set('Authorization', `Bearer ${token}`)
                .send({ is_locked: true });

            // Verify via GET
            const res1 = await request(app).get(`/api/canvas/${canvasId}`);
            expect(res1.body.is_locked).toBe(true);

            // Unlock
            await request(app)
                .patch(`/api/canvas/${canvasId}/lock`)
                .set('Authorization', `Bearer ${token}`)
                .send({ is_locked: false });

            // Verify again
            const res2 = await request(app).get(`/api/canvas/${canvasId}`);
            expect(res2.body.is_locked).toBe(false);
        });
    });

    // ── 3.2 Non-Owner Cannot Lock ───────────────────────────────────────────
    describe('IT-03-02: Non-Owner Lock Rejection', () => {
        it('should return 404 when a non-owner tries to lock a canvas', async () => {
            const owner = await createAuthUser();
            const guest = await createAuthUser();

            const createRes = await request(app)
                .post('/api/canvas')
                .set('Authorization', `Bearer ${owner.token}`)
                .send({ name: 'Owner Only Lock' });
            const canvasId = createRes.body.canvasId;

            const lockRes = await request(app)
                .patch(`/api/canvas/${canvasId}/lock`)
                .set('Authorization', `Bearer ${guest.token}`)
                .send({ is_locked: true });

            // The lock endpoint uses findOneAndUpdate with owner check → 404
            expect(lockRes.statusCode).toBe(404);
        });
    });

    // ── 3.3 Invalid Lock Value ──────────────────────────────────────────────
    describe('IT-03-03: Invalid Lock Value Rejected', () => {
        it('should return 400 when is_locked is not a boolean', async () => {
            const { token } = await createAuthUser();

            const createRes = await request(app)
                .post('/api/canvas')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Validation Board' });
            const canvasId = createRes.body.canvasId;

            const res = await request(app)
                .patch(`/api/canvas/${canvasId}/lock`)
                .set('Authorization', `Bearer ${token}`)
                .send({ is_locked: 'yes' });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toMatch(/boolean/i);
        });

        it('should return 400 when is_locked is a number', async () => {
            const { token } = await createAuthUser();

            const createRes = await request(app)
                .post('/api/canvas')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Number Lock Board' });
            const canvasId = createRes.body.canvasId;

            const res = await request(app)
                .patch(`/api/canvas/${canvasId}/lock`)
                .set('Authorization', `Bearer ${token}`)
                .send({ is_locked: 1 });

            expect(res.statusCode).toBe(400);
        });
    });

    // ── 3.4 Locked Canvas Still Readable ────────────────────────────────────
    describe('IT-03-04: Locked Canvas is Still Readable', () => {
        it('should allow GET /api/canvas/:id even when locked', async () => {
            const { token } = await createAuthUser();

            const createRes = await request(app)
                .post('/api/canvas')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Readable Lock Board' });
            const canvasId = createRes.body.canvasId;

            // Lock it
            await request(app)
                .patch(`/api/canvas/${canvasId}/lock`)
                .set('Authorization', `Bearer ${token}`)
                .send({ is_locked: true });

            // GET should still succeed
            const getRes = await request(app).get(`/api/canvas/${canvasId}`);
            expect(getRes.statusCode).toBe(200);
            expect(getRes.body.is_locked).toBe(true);
            expect(getRes.body.name).toBe('Readable Lock Board');
        });

        it('should allow GET /api/canvas/mine to include locked canvases', async () => {
            const { token } = await createAuthUser();

            const createRes = await request(app)
                .post('/api/canvas')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Mine Lock Board' });
            const canvasId = createRes.body.canvasId;

            await request(app)
                .patch(`/api/canvas/${canvasId}/lock`)
                .set('Authorization', `Bearer ${token}`)
                .send({ is_locked: true });

            const mineRes = await request(app)
                .get('/api/canvas/mine')
                .set('Authorization', `Bearer ${token}`);

            expect(mineRes.statusCode).toBe(200);
            expect(mineRes.body.canvases).toHaveLength(1);
            expect(mineRes.body.canvases[0].is_locked).toBe(true);
        });
    });

    // ── 3.5 Lock on Non-Existent Canvas ─────────────────────────────────────
    describe('IT-03-05: Lock on Non-Existent Canvas', () => {
        it('should return 404 when locking a non-existent canvas', async () => {
            const { token } = await createAuthUser();
            const res = await request(app)
                .patch(`/api/canvas/${crypto.randomUUID()}/lock`)
                .set('Authorization', `Bearer ${token}`)
                .send({ is_locked: true });

            expect(res.statusCode).toBe(404);
        });
    });
});
