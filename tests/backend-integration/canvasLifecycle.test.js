// ============================================================================
// IT-02: Canvas Session Lifecycle Integration Tests
// ============================================================================
// Covers the full canvas lifecycle: creation → details → rename → lock/unlock
// → join → participant management → delete. Each test builds on the previous
// step to verify the integrated flow across multiple API endpoints.
//
// Epics Covered: Epic 1 (Session Management & Access Control)
// ============================================================================

import { jest } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import mongoose from 'mongoose';
import { connect, closeDatabase, clearDatabase } from '../helpers/db.js';

// Mock Google Auth
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

// ─── Shared helper: create authenticated user + token ─────────────────
const createAuthUser = async (overrides = {}) => {
    const id = crypto.randomUUID().slice(0, 8);
    const defaults = {
        name: `User${id}`,
        email: `user${id}@lifecycle.test`,
        password: 'Password123!'
    };
    const data = { ...defaults, ...overrides };
    const res = await request(app).post('/api/auth/register').send(data);
    if (res.statusCode !== 201) throw new Error(`Create user failed: ${res.statusCode}`);
    return { token: res.body.token, userId: res.body.user.id, user: res.body.user };
};

// ─────────────────────────────────────────────────────────────────────────────
describe('IT-02: Canvas Session Lifecycle', () => {

    // ── 2.1 Full Lifecycle: Create → Rename → Lock → Unlock → Delete ────────
    describe('IT-02-01: Complete Canvas Lifecycle', () => {
        it('should support the full create → rename → lock → unlock → delete flow', async () => {
            const { token } = await createAuthUser();

            // 1. Create
            const createRes = await request(app)
                .post('/api/canvas')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Lifecycle Board' });
            expect(createRes.statusCode).toBe(201);
            const canvasId = createRes.body.canvasId;

            // 2. Rename
            const renameRes = await request(app)
                .patch(`/api/canvas/${canvasId}/name`)
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Renamed Board' });
            expect(renameRes.statusCode).toBe(200);
            expect(renameRes.body.name).toBe('Renamed Board');

            // 3. Lock
            const lockRes = await request(app)
                .patch(`/api/canvas/${canvasId}/lock`)
                .set('Authorization', `Bearer ${token}`)
                .send({ is_locked: true });
            expect(lockRes.statusCode).toBe(200);
            expect(lockRes.body.is_locked).toBe(true);

            // 4. Verify lock via GET
            const getRes = await request(app).get(`/api/canvas/${canvasId}`);
            expect(getRes.body.is_locked).toBe(true);
            expect(getRes.body.name).toBe('Renamed Board');

            // 5. Unlock
            const unlockRes = await request(app)
                .patch(`/api/canvas/${canvasId}/lock`)
                .set('Authorization', `Bearer ${token}`)
                .send({ is_locked: false });
            expect(unlockRes.statusCode).toBe(200);
            expect(unlockRes.body.is_locked).toBe(false);

            // 6. Delete
            const deleteRes = await request(app)
                .delete(`/api/canvas/${canvasId}`)
                .set('Authorization', `Bearer ${token}`);
            expect(deleteRes.statusCode).toBe(200);

            // 7. Verify gone
            const goneRes = await request(app).get(`/api/canvas/${canvasId}`);
            expect(goneRes.statusCode).toBe(404);
        });
    });

    // ── 2.2 Multi-User Join Flow ────────────────────────────────────────────
    describe('IT-02-02: Multi-User Join Workflow', () => {
        it('should allow a guest to join a canvas and appear in both Canvas.participants and User.canvases', async () => {
            const owner = await createAuthUser();
            const guest = await createAuthUser();

            // Owner creates canvas
            const createRes = await request(app)
                .post('/api/canvas')
                .set('Authorization', `Bearer ${owner.token}`)
                .send({ name: 'Collab Board' });
            const canvasId = createRes.body.canvasId;

            // Guest joins
            const joinRes = await request(app)
                .post(`/api/canvas/${canvasId}/join`)
                .set('Authorization', `Bearer ${guest.token}`);
            expect(joinRes.statusCode).toBe(200);
            expect(joinRes.body.message).toBe('Joined canvas successfully');

            // Verify Canvas.participants
            const canvas = await Canvas.findById(canvasId);
            expect(canvas.participants).toHaveLength(2);
            const guestParticipant = canvas.participants.find(
                p => p.userId.toString() === guest.userId
            );
            expect(guestParticipant).toBeTruthy();
            expect(guestParticipant.role).toBe('editor');

            // Verify guest's User.canvases
            const guestUser = await User.findById(guest.userId);
            expect(guestUser.canvases).toHaveLength(1);
            expect(guestUser.canvases[0].canvasId).toBe(canvasId);
        });

        it('should not duplicate participants on re-join', async () => {
            const owner = await createAuthUser();
            const guest = await createAuthUser();

            const createRes = await request(app)
                .post('/api/canvas')
                .set('Authorization', `Bearer ${owner.token}`)
                .send({ name: 'Rejoin Board' });
            const canvasId = createRes.body.canvasId;

            // Guest joins twice
            await request(app).post(`/api/canvas/${canvasId}/join`).set('Authorization', `Bearer ${guest.token}`);
            await request(app).post(`/api/canvas/${canvasId}/join`).set('Authorization', `Bearer ${guest.token}`);

            const canvas = await Canvas.findById(canvasId);
            // Should still be 2 (owner + guest), not 3
            expect(canvas.participants).toHaveLength(2);
        });
    });

    // ── 2.3 Owner Rejoin ────────────────────────────────────────────────────
    describe('IT-02-03: Owner Rejoin Own Canvas', () => {
        it('should return "Joined as owner" without modifying participants', async () => {
            const owner = await createAuthUser();

            const createRes = await request(app)
                .post('/api/canvas')
                .set('Authorization', `Bearer ${owner.token}`)
                .send({ name: 'Owner Join Board' });
            const canvasId = createRes.body.canvasId;

            const joinRes = await request(app)
                .post(`/api/canvas/${canvasId}/join`)
                .set('Authorization', `Bearer ${owner.token}`);

            expect(joinRes.statusCode).toBe(200);
            expect(joinRes.body.message).toBe('Joined as owner');

            const canvas = await Canvas.findById(canvasId);
            expect(canvas.participants).toHaveLength(1); // still just the owner
        });
    });

    // ── 2.4 Permission Enforcement ──────────────────────────────────────────
    describe('IT-02-04: Non-Owner Cannot Rename/Delete Canvas', () => {
        it('should return 403 when a non-owner tries to rename a canvas', async () => {
            const owner = await createAuthUser();
            const guest = await createAuthUser();

            const createRes = await request(app)
                .post('/api/canvas')
                .set('Authorization', `Bearer ${owner.token}`)
                .send({ name: 'Protected Board' });
            const canvasId = createRes.body.canvasId;

            const renameRes = await request(app)
                .patch(`/api/canvas/${canvasId}/name`)
                .set('Authorization', `Bearer ${guest.token}`)
                .send({ name: 'Hacked Name' });

            expect(renameRes.statusCode).toBe(403);
        });

        it('should return 403 when a non-owner tries to delete a canvas', async () => {
            const owner = await createAuthUser();
            const guest = await createAuthUser();

            const createRes = await request(app)
                .post('/api/canvas')
                .set('Authorization', `Bearer ${owner.token}`)
                .send({ name: 'Secure Board' });
            const canvasId = createRes.body.canvasId;

            const deleteRes = await request(app)
                .delete(`/api/canvas/${canvasId}`)
                .set('Authorization', `Bearer ${guest.token}`);

            expect(deleteRes.statusCode).toBe(403);
        });
    });

    // ── 2.5 Canvas isCollab Flag ────────────────────────────────────────────
    describe('IT-02-05: isCollab Flag Upon Join', () => {
        it('should return isCollab: true on /mine after a guest joins', async () => {
            const owner = await createAuthUser();
            const guest = await createAuthUser();

            // Create and join
            const createRes = await request(app)
                .post('/api/canvas')
                .set('Authorization', `Bearer ${owner.token}`)
                .send({ name: 'Collab Test' });
            const canvasId = createRes.body.canvasId;

            await request(app)
                .post(`/api/canvas/${canvasId}/join`)
                .set('Authorization', `Bearer ${guest.token}`);

            // Check owner's /mine
            const mineRes = await request(app)
                .get('/api/canvas/mine')
                .set('Authorization', `Bearer ${owner.token}`);

            expect(mineRes.statusCode).toBe(200);
            expect(mineRes.body.canvases).toHaveLength(1);
            expect(mineRes.body.canvases[0].isCollab).toBe(true);
        });
    });

    // ── 2.6 404 For Non-Existent Canvas ─────────────────────────────────────
    describe('IT-02-06: 404 Responses for Missing Canvases', () => {
        it('should return 404 for GET on non-existent canvas', async () => {
            const res = await request(app).get(`/api/canvas/${crypto.randomUUID()}`);
            expect(res.statusCode).toBe(404);
        });

        it('should return 404 for JOIN on non-existent canvas', async () => {
            const { token } = await createAuthUser();
            const res = await request(app)
                .post(`/api/canvas/${crypto.randomUUID()}/join`)
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toBe(404);
        });

        it('should return 404 for DELETE on non-existent canvas', async () => {
            const { token } = await createAuthUser();
            const res = await request(app)
                .delete(`/api/canvas/${crypto.randomUUID()}`)
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toBe(404);
        });
    });
});
