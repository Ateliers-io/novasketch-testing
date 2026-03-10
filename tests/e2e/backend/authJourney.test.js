// ============================================================================
// BACKEND E2E SUITE 1: Full Auth User Journey
// Scenario: New user registers → logs in with credentials → fetches own
//           profile → confirms the JWT is valid end-to-end.
// ============================================================================

import request from 'supertest';
import { jest } from '@jest/globals';
import { connect, closeDatabase, clearDatabase } from '../../helpers/db.js';

jest.setTimeout(30000);

jest.unstable_mockModule('google-auth-library', () => ({
    OAuth2Client: jest.fn(() => ({
        getToken: jest.fn(),
        verifyIdToken: jest.fn()
    }))
}));

const { default: app } = await import('../../../../novasketch-backend/src/app.js');

describe('Backend E2E: Full Auth User Journey', () => {

    // Shared state across tests (simulates a real session)
    let token;
    let userId;
    const userEmail = `e2e-user-${Date.now()}@novasketch.test`;
    const userName = 'E2EUser';
    const userPass = 'E2E_Secure#2024!';

    beforeAll(async () => await connect(), 120000);
    afterAll(async () => {
        await clearDatabase();
        await closeDatabase();
    });

    // Step 1: Register
    it('Step 1 — User registers a new account', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ name: userName, email: userEmail, password: userPass });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('token');
        expect(res.body.user.email).toBe(userEmail);
        token = res.body.token;
        userId = res.body.user.id;
    });

    // Step 2: Login with same credentials
    it('Step 2 — User logs in with registered credentials', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: userEmail, password: userPass });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token');
        // Refresh token for subsequent steps
        token = res.body.token;
    });

    // Step 3: Fetch profile using token from login
    it('Step 3 — User fetches own profile with the login token', async () => {
        const res = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.email).toBe(userEmail);
        expect(res.body.displayName).toBe(userName);
    });

    // Step 4: Wrong password cannot be used after registration
    it('Step 4 — Login fails with wrong password (security check)', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: userEmail, password: 'WrongPassword123!' });

        expect(res.statusCode).toBe(401);
    });

    // Step 5: Duplicate registration blocked
    it('Step 5 — Re-registering same email is blocked (409)', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ name: 'Duplicate', email: userEmail, password: userPass });

        expect(res.statusCode).toBe(409);
    });

    // Step 6: Token from registration is usable immediately
    it('Step 6 — First-registration token is immediately usable for /api/auth/me', async () => {
        // Register a fresh user and use the registration token directly
        const regRes = await request(app)
            .post('/api/auth/register')
            .send({ name: 'Instant', email: `instant-${Date.now()}@test.com`, password: userPass });

        expect(regRes.statusCode).toBe(201);
        const regToken = regRes.body.token;

        const meRes = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${regToken}`);

        expect(meRes.statusCode).toBe(200);
        expect(meRes.body.email).toBeDefined();
    });
});
