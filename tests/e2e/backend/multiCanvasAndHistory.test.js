// ============================================================================
// BACKEND E2E SUITE 3: Multi-Canvas Management & History/Shape API Journey
// Scenario: User creates multiple canvases → manages them → tests
//           history and shape API endpoints across the full session.
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

describe('Backend E2E: Multi-Canvas Management & Supporting APIs', () => {

    let token;
    const createdCanvasIds = [];

    beforeAll(async () => await connect(), 120000);
    afterAll(async () => {
        await clearDatabase();
        await closeDatabase();
    });

    // Step 1: Authenticate
    it('Step 1 — User authenticates for the session', async () => {
        const { token: t } = await registerAndLogin(app);
        token = t;
        expect(token).toBeDefined();
    });

    // Step 2: Create multiple canvases in sequence
    it('Step 2 — User creates three canvases in sequence', async () => {
        const names = ['Project Alpha', 'Project Beta', 'Project Gamma'];
        for (const name of names) {
            const res = await request(app)
                .post('/api/canvas')
                .set('Authorization', `Bearer ${token}`)
                .send({ name });
            expect(res.statusCode).toBe(201);
            createdCanvasIds.push(res.body.canvasId);
        }
        expect(createdCanvasIds).toHaveLength(3);
    });

    // Step 3: All canvases in user list
    it('Step 3 — All three canvases appear in user\'s canvas list', async () => {
        const res = await request(app)
            .get('/api/canvas/mine')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.canvases.length).toBeGreaterThanOrEqual(3);
        for (const id of createdCanvasIds) {
            const found = res.body.canvases.find(c => c.canvasId === id);
            expect(found).toBeDefined();
        }
    });

    // Step 4: Rename all canvases
    it('Step 4 — User renames all canvases', async () => {
        for (let i = 0; i < createdCanvasIds.length; i++) {
            const res = await request(app)
                .patch(`/api/canvas/${createdCanvasIds[i]}/name`)
                .set('Authorization', `Bearer ${token}`)
                .send({ name: `Renamed Project ${i + 1}` });
            expect(res.statusCode).toBe(200);
            expect(res.body.name).toBe(`Renamed Project ${i + 1}`);
        }
    });

    // Step 5: Lock, then unlock one canvas
    it('Step 5 — User locks then unlocks one canvas (toggle cycle)', async () => {
        const id = createdCanvasIds[0];

        const lockRes = await request(app)
            .patch(`/api/canvas/${id}/lock`)
            .set('Authorization', `Bearer ${token}`)
            .send({ is_locked: true });
        expect(lockRes.body.is_locked).toBe(true);

        const unlockRes = await request(app)
            .patch(`/api/canvas/${id}/lock`)
            .set('Authorization', `Bearer ${token}`)
            .send({ is_locked: false });
        expect(unlockRes.body.is_locked).toBe(false);
    });

    // Step 6: History API — empty session returns clean empty array
    it('Step 6 — History API returns empty array for a new canvas session', async () => {
        const sessionId = createdCanvasIds[0];
        const res = await request(app).get(`/api/history/${sessionId}`);
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    // Step 7: History API — delete on empty session is safe
    it('Step 7 — History DELETE on empty session completes gracefully', async () => {
        const res = await request(app).delete(`/api/history/${createdCanvasIds[1]}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('deleted');
        expect(typeof res.body.deleted).toBe('number');
    });

    // Step 8: Shape API — non-existent room returns 404
    it('Step 8 — Shape API returns 404 for a non-existent room', async () => {
        const res = await request(app)
            .get('/api/rooms/fake-e2e-room-id/shapes');
        expect(res.statusCode).toBe(404);
    });

    // Step 9: Delete all canvases (cleanup and verify batch)
    it('Step 9 — User deletes all three canvases (batch cleanup)', async () => {
        for (const id of createdCanvasIds) {
            const res = await request(app)
                .delete(`/api/canvas/${id}`)
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toBe(200);
        }

        const listRes = await request(app)
            .get('/api/canvas/mine')
            .set('Authorization', `Bearer ${token}`);
        // Canvas list should now be empty
        expect(listRes.body.canvases.length).toBe(0);
    });

    // Step 10: Health still OK after heavy workload
    it('Step 10 — Health endpoint still responds OK after full session', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('OK');
    });
});
