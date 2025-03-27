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

// Load environment variables from .env.e2e
dotenv.config({ path: '.env.e2e' });

if (process.env.NODE_ENV !== 'e2e') {
    throw new Error('NODE_ENV is not set to e2e');
}

let db: any;

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
    db = await initORM();

    // Seed test data
    for (const urlData of testUrls) {
        const url = db.em.create(Url, urlData);
        await db.em.persistAndFlush(url);
    }
});

afterAll(async () => {
    // Clean up test data
    await db.em.nativeDelete(Url, {});

    // Close database connection
    await db.orm.close();
});






