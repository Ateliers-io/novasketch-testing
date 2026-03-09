// ============================================================================
// IT-04: Shape & Room Data Persistence Integration Tests
// ============================================================================
// Tests the /api/rooms shape routes against a real MongoDB backend.
// Seeds Yjs documents with shapes and verifies the REST endpoints return
// the correct shape data. Covers listing, single retrieval, and 404 paths.
//
// Epics Covered: Epic 2 (Core Drawing Tools), Epic 6 (Data Persistence)
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
const { default: Room } = await import('../../../novasketch-backend/src/models/Room.js');

beforeAll(async () => await connect(), 120000);
afterEach(async () => {
    await clearDatabase();
    jest.clearAllMocks();
});
afterAll(async () => await closeDatabase());

// Helper: create a Room document with given shapes via Yjs
const seedRoom = async (roomId, shapes = {}) => {
    const doc = new Y.Doc();
    const shapesMap = doc.getMap('shapes');
    for (const [id, data] of Object.entries(shapes)) {
        shapesMap.set(id, data);
    }
    const update = Y.encodeStateAsUpdate(doc);
    await Room.create({ _id: roomId, data: Buffer.from(update) });
    return roomId;
};

// ─────────────────────────────────────────────────────────────────────────────
describe('IT-04: Shape & Room Data Persistence', () => {

    // ── 4.1 List All Shapes ────────────────────────────────────────────────
    describe('IT-04-01: GET /api/rooms/:roomId/shapes', () => {
        it('should return all shapes in a seeded room', async () => {
            const roomId = crypto.randomUUID();
            await seedRoom(roomId, {
                rect1: { type: 'rectangle', x: 10, y: 20, width: 100, height: 50 },
                circle1: { type: 'circle', x: 150, y: 75, radius: 30 },
            });

            const res = await request(app).get(`/api/rooms/${roomId}/shapes`);

            expect(res.statusCode).toBe(200);
            expect(res.body.roomId).toBe(roomId);
            expect(res.body.count).toBe(2);
            expect(res.body.shapes).toHaveLength(2);

            const ids = res.body.shapes.map(s => s.id);
            expect(ids).toContain('rect1');
            expect(ids).toContain('circle1');
        });

        it('should return count: 0 for a room with no shapes', async () => {
            const roomId = crypto.randomUUID();
            await seedRoom(roomId); // no shapes

            const res = await request(app).get(`/api/rooms/${roomId}/shapes`);

            expect(res.statusCode).toBe(200);
            expect(res.body.count).toBe(0);
            expect(res.body.shapes).toHaveLength(0);
        });

        it('should return 404 for a non-existent room', async () => {
            const res = await request(app).get('/api/rooms/nonexistent-room/shapes');
            expect(res.statusCode).toBe(404);
            expect(res.body.error).toBe('Room not found');
        });
    });

    // ── 4.2 Get Single Shape ───────────────────────────────────────────────
    describe('IT-04-02: GET /api/rooms/:roomId/shape/:shapeId', () => {
        it('should return the specific shape by ID', async () => {
            const roomId = crypto.randomUUID();
            await seedRoom(roomId, {
                myCircle: { type: 'circle', r: 50, fill: '#FF0000' },
                myRect: { type: 'rectangle', width: 200, height: 100 },
            });

            const res = await request(app).get(`/api/rooms/${roomId}/shape/myCircle`);

            expect(res.statusCode).toBe(200);
            expect(res.body.id).toBe('myCircle');
            expect(res.body.type).toBe('circle');
            expect(res.body.r).toBe(50);
            expect(res.body.fill).toBe('#FF0000');
        });

        it('should return 404 when shape does not exist in room', async () => {
            const roomId = crypto.randomUUID();
            await seedRoom(roomId, {
                existingShape: { type: 'line', x1: 0, y1: 0 },
            });

            const res = await request(app).get(`/api/rooms/${roomId}/shape/missing-shape`);
            expect(res.statusCode).toBe(404);
            expect(res.body.error).toBe('Shape not found');
        });

        it('should return 404 when room does not exist', async () => {
            const res = await request(app).get(`/api/rooms/${crypto.randomUUID()}/shape/any-shape`);
            expect(res.statusCode).toBe(404);
        });
    });

    // ── 4.3 Multiple Shape Types ───────────────────────────────────────────
    describe('IT-04-03: Multiple Shape Types Persisted Correctly', () => {
        it('should correctly store and retrieve freehand, rectangle, circle, and text shapes', async () => {
            const roomId = crypto.randomUUID();
            await seedRoom(roomId, {
                freehand1: { type: 'freehand', points: [[0, 0], [10, 10], [20, 5]], strokeWidth: 3, color: '#000' },
                rect1: { type: 'rectangle', x: 50, y: 50, width: 100, height: 60, fill: '#0000FF' },
                circle1: { type: 'circle', x: 200, y: 200, radius: 40, fill: '#00FF00' },
                text1: { type: 'text', x: 300, y: 100, content: 'Hello World', fontSize: 16 },
            });

            const res = await request(app).get(`/api/rooms/${roomId}/shapes`);
            expect(res.statusCode).toBe(200);
            expect(res.body.count).toBe(4);

            // Verify each type
            const byType = {};
            res.body.shapes.forEach(s => { byType[s.type] = s; });

            expect(byType.freehand.points).toHaveLength(3);
            expect(byType.rectangle.width).toBe(100);
            expect(byType.circle.radius).toBe(40);
            expect(byType.text.content).toBe('Hello World');
        });
    });

    // ── 4.4 Shape Data Integrity ───────────────────────────────────────────
    describe('IT-04-04: Shape Property Integrity', () => {
        it('should preserve all custom properties through Yjs encode/decode cycle', async () => {
            const roomId = crypto.randomUUID();
            const complexShape = {
                type: 'rectangle',
                x: 42.5,
                y: 99.9,
                width: 150,
                height: 80,
                fill: '#FF5733',
                stroke: '#333333',
                strokeWidth: 2,
                rotation: 45,
                opacity: 0.8,
                zIndex: 5,
                locked: false,
            };
            await seedRoom(roomId, { complex1: complexShape });

            const res = await request(app).get(`/api/rooms/${roomId}/shape/complex1`);
            expect(res.statusCode).toBe(200);
            expect(res.body.x).toBeCloseTo(42.5);
            expect(res.body.y).toBeCloseTo(99.9);
            expect(res.body.rotation).toBe(45);
            expect(res.body.opacity).toBeCloseTo(0.8);
            expect(res.body.fill).toBe('#FF5733');
        });
    });
});
