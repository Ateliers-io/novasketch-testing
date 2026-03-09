// ============================================================================
// IT-05: History / Timeline Replay Integration Tests
// ============================================================================
// Tests the /api/history endpoints that store and retrieve Yjs state snapshots
// for timeline replay. Covers creation, retrieval, sorting, and cleanup.
//
// Epics Covered: Epic 8 (8.1 Timeline Replay)
// ============================================================================

import { jest } from '@jest/globals';
import request from 'supertest';
import crypto from 'node:crypto';
import * as Y from 'yjs';
import { connect, closeDatabase, clearDatabase } from '../helpers/db.js';

jest.unstable_mockModule('google-auth-library', () => ({
    OAuth2Client: jest.fn(() => ({
        getToken: jest.fn(),
        verifyIdToken: jest.fn()
    }))
}));

const { default: app } = await import('../../../novasketch-backend/src/app.js');
const { default: History } = await import('../../../novasketch-backend/src/models/History.js');

beforeAll(async () => await connect(), 120000);
afterEach(async () => {
    await clearDatabase();
    jest.clearAllMocks();
});
afterAll(async () => await closeDatabase());

// Helper: create a Yjs snapshot buffer
const createSnapshot = (shapes = {}) => {
    const doc = new Y.Doc();
    const shapesMap = doc.getMap('shapes');
    for (const [id, data] of Object.entries(shapes)) {
        shapesMap.set(id, data);
    }
    return Buffer.from(Y.encodeStateAsUpdate(doc));
};

// ─────────────────────────────────────────────────────────────────────────────
describe('IT-05: History / Timeline Replay', () => {

    // ── 5.1 Retrieve Snapshots ─────────────────────────────────────────────
    describe('IT-05-01: GET /api/history/:sessionId', () => {
        it('should return snapshots sorted by timestamp ascending', async () => {
            const sessionId = crypto.randomUUID();

            // Create 3 snapshots with known timestamps
            const t1 = new Date('2025-01-01T10:00:00Z');
            const t2 = new Date('2025-01-01T10:01:00Z');
            const t3 = new Date('2025-01-01T10:02:00Z');

            await History.create([
                { sessionId, update: createSnapshot({ rect1: { type: 'rectangle' } }), timestamp: t2 },
                { sessionId, update: createSnapshot({ rect1: { type: 'rectangle' }, circle1: { type: 'circle' } }), timestamp: t3 },
                { sessionId, update: createSnapshot({}), timestamp: t1 },
            ]);

            const res = await request(app).get(`/api/history/${sessionId}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveLength(3);

            // Verify ascending order
            const timestamps = res.body.map(s => new Date(s.timestamp).getTime());
            expect(timestamps[0]).toBeLessThan(timestamps[1]);
            expect(timestamps[1]).toBeLessThan(timestamps[2]);
        });

        it('should return empty array for a session with no history', async () => {
            const res = await request(app).get(`/api/history/${crypto.randomUUID()}`);
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveLength(0);
        });

        it('should return base64 encoded updates that can be decoded by Yjs', async () => {
            const sessionId = crypto.randomUUID();
            await History.create({
                sessionId,
                update: createSnapshot({ testShape: { type: 'line', x1: 0, y1: 0, x2: 100, y2: 100 } }),
            });

            const res = await request(app).get(`/api/history/${sessionId}`);
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveLength(1);

            // Decode the base64 update using Yjs
            const updateBuffer = Buffer.from(res.body[0].update, 'base64');
            const doc = new Y.Doc();
            Y.applyUpdate(doc, new Uint8Array(updateBuffer));
            const shapes = doc.getMap('shapes');
            const testShape = shapes.get('testShape');
            expect(testShape).toBeTruthy();
            expect(testShape.type).toBe('line');
        });
    });

    // ── 5.2 Delete Snapshots ───────────────────────────────────────────────
    describe('IT-05-02: DELETE /api/history/:sessionId', () => {
        it('should delete all snapshots for a session and return count', async () => {
            const sessionId = crypto.randomUUID();

            await History.create([
                { sessionId, update: createSnapshot({}) },
                { sessionId, update: createSnapshot({}) },
                { sessionId, update: createSnapshot({}) },
            ]);

            const deleteRes = await request(app).delete(`/api/history/${sessionId}`);
            expect(deleteRes.statusCode).toBe(200);
            expect(deleteRes.body.deleted).toBe(3);

            // Verify they're gone
            const getRes = await request(app).get(`/api/history/${sessionId}`);
            expect(getRes.body).toHaveLength(0);
        });

        it('should return deleted: 0 for a session with no history', async () => {
            const res = await request(app).delete(`/api/history/${crypto.randomUUID()}`);
            expect(res.statusCode).toBe(200);
            expect(res.body.deleted).toBe(0);
        });

        it('should not affect snapshots from other sessions', async () => {
            const session1 = crypto.randomUUID();
            const session2 = crypto.randomUUID();

            await History.create([
                { sessionId: session1, update: createSnapshot({}) },
                { sessionId: session2, update: createSnapshot({}) },
            ]);

            await request(app).delete(`/api/history/${session1}`);

            // session2 should still have its snapshot
            const res = await request(app).get(`/api/history/${session2}`);
            expect(res.body).toHaveLength(1);
        });
    });

    // ── 5.3 Snapshot Replay Integrity ──────────────────────────────────────
    describe('IT-05-03: Timeline Replay Data Integrity', () => {
        it('should produce incrementally larger snapshots as shapes are added', async () => {
            const sessionId = crypto.randomUUID();

            // Simulate drawing progression
            const snap1 = createSnapshot({ line1: { type: 'line' } });
            const snap2 = createSnapshot({ line1: { type: 'line' }, rect1: { type: 'rectangle' } });
            const snap3 = createSnapshot({
                line1: { type: 'line' },
                rect1: { type: 'rectangle' },
                circle1: { type: 'circle' },
            });

            await History.create([
                { sessionId, update: snap1, timestamp: new Date('2025-01-01T10:00:00Z') },
                { sessionId, update: snap2, timestamp: new Date('2025-01-01T10:01:00Z') },
                { sessionId, update: snap3, timestamp: new Date('2025-01-01T10:02:00Z') },
            ]);

            const res = await request(app).get(`/api/history/${sessionId}`);
            expect(res.body).toHaveLength(3);

            // Decode each snapshot and verify shape count grows
            const counts = res.body.map(s => {
                const doc = new Y.Doc();
                Y.applyUpdate(doc, new Uint8Array(Buffer.from(s.update, 'base64')));
                return doc.getMap('shapes').size;
            });

            expect(counts).toEqual([1, 2, 3]);
        });
    });
});
