// tests/helpers/db.js — MongoDB test helper.
//
// Provides connect / clearDatabase / closeDatabase functions.
// Each Jest worker gets its own isolated database via a unique suffix
// so parallel suites never interfere.

import mongoose from 'mongoose';
import crypto from 'node:crypto';

const DB_ID = crypto.randomUUID().replace(/-/g, '').slice(0, 12);

const getTestUri = () => {
    const base = process.env.MONGO_URI;
    if (!base) throw new Error('MONGO_URI is not set — check your .env file');
    const url = new URL(base);
    url.pathname = `/novasketch-integ-${DB_ID}`;
    return url.toString();
};

export const clearDatabase = async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
};

export const connect = async () => {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(getTestUri());
    }
    await clearDatabase();
};

export const closeDatabase = async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
};
