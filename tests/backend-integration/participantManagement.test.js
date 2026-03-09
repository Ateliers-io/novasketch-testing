// ============================================================================
// IT-07: Participant Management Integration Tests
// ============================================================================
// Tests the full participant management workflow: adding participants with
// roles, auto-join, ownership-only operations, CanvasMembership model,
// and cross-model data consistency.
//
// Epics Covered: Epic 1 (1.3 User Identification, 1.4 Presence, 1.5 Read-Only)
// ============================================================================

import { jest } from '@jest/globals';
import request from 'supertest';
import crypto from 'node:crypto';
import mongoose from 'mongoose';
import { connect, closeDatabase, clearDatabase } from '../helpers/db.js';

jest.unstable_mockModule('google-auth-library', () => ({
    OAuth2Client: jest.fn(() => ({
        getToken: jest.fn(),
        verifyIdToken: jest.fn()
    }))
}));

const { default: app } = await import('../../../novasketch-backend/src/app.js');
const { default: User } = await import('../../../novasketch-backend/src/models/User.js');
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
        email: `user${id}@participant.test`,
        password: 'Password123!',
        ...overrides,
    };
    const res = await request(app).post('/api/auth/register').send(data);
    if (res.statusCode !== 201) throw new Error(`Create user failed: ${res.statusCode}`);
    return { token: res.body.token, userId: res.body.user.id };
};

// ─────────────────────────────────────────────────────────────────────────────
describe('IT-07: Participant Management', () => {

    // ── 7.1 Owner Adds Participant ─────────────────────────────────────────
    describe('IT-07-01: Owner Adds Participant via API', () => {
        it('should add a participant with the specified role', async () => {
            const owner = await createAuthUser();
            const participant = await createAuthUser();

            const createRes = await request(app)
                .post('/api/canvas')
                .set('Authorization', `Bearer ${owner.token}`)
                .send({ name: 'Team Board' });
            const canvasId = createRes.body.canvasId;

            const addRes = await request(app)
                .post(`/api/canvas/${canvasId}/participants`)
                .set('Authorization', `Bearer ${owner.token}`)
                .send({ userId: participant.userId, role: 'viewer' });

            expect(addRes.statusCode).toBe(200);
            expect(addRes.body.message).toBe('Participant added');

            // Verify CanvasMembership record
            const membership = await mongoose.model('CanvasMembership').findOne({
                canvasId,
                userId: participant.userId,
            });
            expect(membership).toBeTruthy();
            expect(membership.role).toBe('viewer');
        });
    });

    // ── 7.2 Non-Owner Cannot Add Participants ──────────────────────────────
    describe('IT-07-02: Non-Owner Rejection', () => {
        it('should return 403 when a non-owner tries to add a participant', async () => {
            const owner = await createAuthUser();
            const notOwner = await createAuthUser();
            const target = await createAuthUser();

            const createRes = await request(app)
                .post('/api/canvas')
                .set('Authorization', `Bearer ${owner.token}`)
                .send({ name: 'Restricted Board' });
            const canvasId = createRes.body.canvasId;

            const res = await request(app)
                .post(`/api/canvas/${canvasId}/participants`)
                .set('Authorization', `Bearer ${notOwner.token}`)
                .send({ userId: target.userId, role: 'editor' });

            expect(res.statusCode).toBe(403);
            expect(res.body.message).toBe('Unauthorized');
        });
    });

    // ── 7.3 Add Non-Existent User ──────────────────────────────────────────
    describe('IT-07-03: Adding Non-Existent User', () => {
        it('should return 404 when adding a user that does not exist', async () => {
            const owner = await createAuthUser();

            const createRes = await request(app)
                .post('/api/canvas')
                .set('Authorization', `Bearer ${owner.token}`)
                .send({ name: 'Ghost User Board' });
            const canvasId = createRes.body.canvasId;

            const res = await request(app)
                .post(`/api/canvas/${canvasId}/participants`)
                .set('Authorization', `Bearer ${owner.token}`)
                .send({ userId: new mongoose.Types.ObjectId(), role: 'editor' });

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe('Target user not found');
        });
    });

    // ── 7.4 Guest Canvas Visibility ────────────────────────────────────────
    describe('IT-07-04: Joined Canvas Appears in Guest /mine', () => {
        it('should show the joined canvas in the guest user /mine list', async () => {
            const owner = await createAuthUser();
            const guest = await createAuthUser();

            const createRes = await request(app)
                .post('/api/canvas')
                .set('Authorization', `Bearer ${owner.token}`)
                .send({ name: 'Guest Visible Board' });
            const canvasId = createRes.body.canvasId;

            // Guest joins
            await request(app)
                .post(`/api/canvas/${canvasId}/join`)
                .set('Authorization', `Bearer ${guest.token}`);

            // Guest checks /mine
            const mineRes = await request(app)
                .get('/api/canvas/mine')
                .set('Authorization', `Bearer ${guest.token}`);

            expect(mineRes.statusCode).toBe(200);
            expect(mineRes.body.canvases).toHaveLength(1);
            expect(mineRes.body.canvases[0].canvasId).toBe(canvasId);
            expect(mineRes.body.canvases[0].role).toBe('editor');
        });
    });

    // ── 7.5 Delete Canvas Cleans Up Memberships ────────────────────────────
    describe('IT-07-05: Canvas Deletion Cleans Up Memberships', () => {
        it('should remove all CanvasMembership records when canvas is deleted', async () => {
            const owner = await createAuthUser();
            const guest = await createAuthUser();

            const createRes = await request(app)
                .post('/api/canvas')
                .set('Authorization', `Bearer ${owner.token}`)
                .send({ name: 'Cleanup Board' });
            const canvasId = createRes.body.canvasId;

            // Add participant via owner
            await request(app)
                .post(`/api/canvas/${canvasId}/participants`)
                .set('Authorization', `Bearer ${owner.token}`)
                .send({ userId: guest.userId, role: 'editor' });

            // Verify membership exists
            const before = await mongoose.model('CanvasMembership').find({ canvasId });
            expect(before.length).toBeGreaterThanOrEqual(1);

            // Delete canvas
            await request(app)
                .delete(`/api/canvas/${canvasId}`)
                .set('Authorization', `Bearer ${owner.token}`);

            // Verify all memberships are gone
            const after = await mongoose.model('CanvasMembership').find({ canvasId });
            expect(after).toHaveLength(0);
        });
    });

    // ── 7.6 Multiple Canvases Per User ─────────────────────────────────────
    describe('IT-07-06: User With Multiple Canvases', () => {
        it('should list all canvases a user owns or has joined', async () => {
            const user = await createAuthUser();
            const otherOwner = await createAuthUser();

            // User creates 2 canvases
            await request(app).post('/api/canvas').set('Authorization', `Bearer ${user.token}`).send({ name: 'Board A' });
            await request(app).post('/api/canvas').set('Authorization', `Bearer ${user.token}`).send({ name: 'Board B' });

            // Other owner creates a canvas, user joins it
            const otherRes = await request(app)
                .post('/api/canvas')
                .set('Authorization', `Bearer ${otherOwner.token}`)
                .send({ name: 'Other Board' });
            await request(app)
                .post(`/api/canvas/${otherRes.body.canvasId}/join`)
                .set('Authorization', `Bearer ${user.token}`);

            // User should see 3 canvases
            const mineRes = await request(app)
                .get('/api/canvas/mine')
                .set('Authorization', `Bearer ${user.token}`);

            expect(mineRes.statusCode).toBe(200);
            expect(mineRes.body.canvases).toHaveLength(3);
        });
    });
});
