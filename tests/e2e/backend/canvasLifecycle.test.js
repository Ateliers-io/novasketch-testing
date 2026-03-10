// ============================================================================
// BACKEND E2E SUITE 2: Full Canvas Lifecycle Journey
// Scenario: User registers → creates canvas → renames it → locks it →
//           adds a collaborator → joins the board → deletes it.
//           Tests the full canvas lifecycle as a real user would experience it.
// ============================================================================

import request from 'supertest';
import { jest } from '@jest/globals';
import { connect, closeDatabase, clearDatabase } from '../../helpers/db.js';
import { registerAndLogin } from '../../helpers/auth.js';

jest.setTimeout(30000);

jest.unstable_mockModule('google-auth-library', () => ({
    OAuth2Client: jest.fn(() => ({
        getToken: jest.fn(),
        verifyIdToken: jest.fn()
    }))
}));

const { default: app } = await import('../../../../novasketch-backend/src/app.js');

describe('Backend E2E: Full Canvas Lifecycle', () => {

    let ownerToken;
    let ownerUserId;
    let collabToken;
    let collabUserId;
    let canvasId;

    beforeAll(async () => await connect(), 120000);
    afterAll(async () => {
        await clearDatabase();
        await closeDatabase();
    });

    // Step 1: Owner registers and logs in
    it('Step 1 — Owner registers and gets a session token', async () => {
        const { token, userId } = await registerAndLogin(app);
        ownerToken = token;
        ownerUserId = userId;
        expect(ownerToken).toBeDefined();
    });

    // Step 2: Collaborator registers
    it('Step 2 — A collaborator registers with a different account', async () => {
        const { token, userId } = await registerAndLogin(app);
        collabToken = token;
        collabUserId = userId;
        expect(collabToken).toBeDefined();
    });

    // Step 3: Owner creates a canvas
    it('Step 3 — Owner creates a new canvas board', async () => {
        const res = await request(app)
            .post('/api/canvas')
            .set('Authorization', `Bearer ${ownerToken}`)
            .send({ name: 'E2E Design Board' });

        expect(res.statusCode).toBe(201);
        expect(res.body.name).toBe('E2E Design Board');
        expect(res.body).toHaveProperty('canvasId');
        expect(res.body).toHaveProperty('url');
        canvasId = res.body.canvasId;
    });

    // Step 4: Canvas appears in owner's list
    it('Step 4 — Canvas appears in owner\'s canvas list', async () => {
        const res = await request(app)
            .get('/api/canvas/mine')
            .set('Authorization', `Bearer ${ownerToken}`);

        expect(res.statusCode).toBe(200);
        const found = res.body.canvases.find(c => c.canvasId === canvasId);
        expect(found).toBeDefined();
        expect(found.name).toBe('E2E Design Board');
        expect(found.role).toBe('owner');
    });

    // Step 5: Owner views canvas details
    it('Step 5 — Owner can view full canvas details', async () => {
        const res = await request(app)
            .get(`/api/canvas/${canvasId}`)
            .set('Authorization', `Bearer ${ownerToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.canvasId).toBe(canvasId);
        expect(res.body.name).toBe('E2E Design Board');
        expect(res.body.is_locked).toBe(false);
        expect(res.body.participants).toBeInstanceOf(Array);
        expect(res.body.participants.length).toBeGreaterThan(0);
    });

    // Step 6: Owner renames the canvas
    it('Step 6 — Owner renames the canvas', async () => {
        const res = await request(app)
            .patch(`/api/canvas/${canvasId}/name`)
            .set('Authorization', `Bearer ${ownerToken}`)
            .send({ name: 'E2E Renamed Board' });

        expect(res.statusCode).toBe(200);
        expect(res.body.name).toBe('E2E Renamed Board');

        // Verify rename persisted
        const getRes = await request(app)
            .get(`/api/canvas/${canvasId}`)
            .set('Authorization', `Bearer ${ownerToken}`);
        expect(getRes.body.name).toBe('E2E Renamed Board');
    });

    // Step 7: Collaborator joins the canvas via the join endpoint
    it('Step 7 — Collaborator joins the canvas via join link', async () => {
        const res = await request(app)
            .post(`/api/canvas/${canvasId}/join`)
            .set('Authorization', `Bearer ${collabToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toMatch(/join/i);
    });

    // Step 8: Owner locks the canvas
    it('Step 8 — Owner locks the canvas (preventing writes)', async () => {
        const res = await request(app)
            .patch(`/api/canvas/${canvasId}/lock`)
            .set('Authorization', `Bearer ${ownerToken}`)
            .send({ is_locked: true });

        expect(res.statusCode).toBe(200);
        expect(res.body.is_locked).toBe(true);
    });

    // Step 9: Verify canvas locked state persisted
    it('Step 9 — Canvas locked state is persisted and visible', async () => {
        const res = await request(app)
            .get(`/api/canvas/${canvasId}`)
            .set('Authorization', `Bearer ${ownerToken}`);

        expect(res.body.is_locked).toBe(true);
    });

    // Step 10: Owner unlocks the canvas again
    it('Step 10 — Owner unlocks the canvas', async () => {
        const res = await request(app)
            .patch(`/api/canvas/${canvasId}/lock`)
            .set('Authorization', `Bearer ${ownerToken}`)
            .send({ is_locked: false });

        expect(res.statusCode).toBe(200);
        expect(res.body.is_locked).toBe(false);
    });

    // Step 11: Collaborator cannot delete canvas (403)
    it('Step 11 — Collaborator cannot delete canvas (ownership enforced)', async () => {
        const res = await request(app)
            .delete(`/api/canvas/${canvasId}`)
            .set('Authorization', `Bearer ${collabToken}`);

        expect(res.statusCode).toBe(403);
    });

    // Step 12: Owner deletes the canvas (full lifecycle complete)
    it('Step 12 — Owner deletes the canvas (lifecycle complete)', async () => {
        const res = await request(app)
            .delete(`/api/canvas/${canvasId}`)
            .set('Authorization', `Bearer ${ownerToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Canvas deleted successfully');

        // Verify it's gone
        const getRes = await request(app)
            .get(`/api/canvas/${canvasId}`)
            .set('Authorization', `Bearer ${ownerToken}`);
        expect(getRes.statusCode).toBe(404);
    });
});
