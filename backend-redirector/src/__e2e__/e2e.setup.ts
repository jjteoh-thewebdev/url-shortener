// We assume that the test database is already created and migrated up to date
// and the DATABASE_URL is set

// initialize dotenv config from .env.e2e

// before all e2e tests
// seed the database with some data using Mikro ORM
// create a short url without password
// create a short url without password but expired
// create a short url with password
// create a short url with password but expired

// after all e2e tests
// delete all inserted data

import dotenv from 'dotenv';
import { initORM } from '../plugins/db.js';
import { Url } from '../modules/url/url.entity.js';
import bcrypt from 'bcryptjs';
import { MikroORM } from '@mikro-orm/core';
import config from '../mikro-orm.config.js';

// Load environment variables from .env.e2e
dotenv.config({ path: `${process.cwd()}/.env.e2e`, override: true });

if (process.env.NODE_ENV !== 'e2e') {
    throw new Error('NODE_ENV is not set to e2e');
}

let db: MikroORM;

// Test data
const testUrls = [
    {
        shortUrl: 'test1',
        longUrl: 'https://example.com/test1',
        passwordHash: undefined,
        expiredAt: undefined,
        visitorCount: 0n
    },
    {
        shortUrl: 'test2',
        longUrl: 'https://example.com/test2',
        passwordHash: undefined,
        expiredAt: new Date(Date.now() - 1000), // 1 second ago
        visitorCount: 0n
    },
    {
        shortUrl: 'test3',
        longUrl: 'https://example.com/test3',
        passwordHash: bcrypt.hashSync('test123', 10),
        expiredAt: undefined,
        visitorCount: 0n
    },
    {
        shortUrl: 'test4',
        longUrl: 'https://example.com/test4',
        passwordHash: bcrypt.hashSync('test123', 10),
        expiredAt: new Date(Date.now() - 1000), // 1 second ago
        visitorCount: 0n
    }
];

beforeAll(async () => {
    // Initialize database connection
    // db = await initORM();
    db = await MikroORM.init({
        ...config,
        clientUrl: process.env.DATABASE_URL
    })

    const fork = db.em.fork()

    // Seed test data
    for (const urlData of testUrls) {
        const url = fork.create(Url, urlData);
        await fork.persistAndFlush(url);
    }
});

afterAll(async () => {
    const fork = db.em.fork()

    // Clean up test data
    await fork.nativeDelete(Url, {});

    // Close database connection
    await db.close();
});






