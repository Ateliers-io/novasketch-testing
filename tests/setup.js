// tests/setup.js — Global test setup for the novasketch-testing project.
//
// Runs before every test file. Configures environment variables and test timeout.
// Points at a dedicated test database so production data is never touched.

import 'dotenv/config';

// Mark as test environment so rate limiting is skipped in the backend app
process.env.NODE_ENV = 'test';

// Fake credentials for auth tests
process.env.JWT_SECRET = 'test-jwt-secret-key-for-integration-tests';
process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';
process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret';

// Use test DB to not pollute production
if (process.env.MONGO_URI) {
    const url = new URL(process.env.MONGO_URI);
    url.pathname = '/novasketch-integration-test';
    process.env.MONGO_URI = url.toString();
}

import { jest } from '@jest/globals';
jest.setTimeout(15000); // 15s – integration tests may need extra time for DB ops
