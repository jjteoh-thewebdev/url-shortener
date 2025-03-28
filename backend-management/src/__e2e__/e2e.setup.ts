import { PrismaClient } from '@prisma/client';
import { server } from '../index';
import dotenv from 'dotenv';

// Pre-requisition:
// we assume that the test database is already created and migrated up to date
// and the DATABASE_URL is set

dotenv.config({ path: `${process.cwd()}/.env.e2e`, override: true });

if (process.env.NODE_ENV !== 'e2e') {
    throw new Error('NODE_ENV is not set to e2e');
}

let prisma: PrismaClient;

beforeAll(async () => {
    prisma = new PrismaClient({
        datasources: {
            db: {
                // connect to test database
                url: process.env.DATABASE_URL,
            }
        }
    });
});

afterAll(async () => {
    await prisma.$disconnect();
    server.close();
});

// Clean up the database after each test
afterEach(async () => {
    const tables = await prisma.$queryRaw<
        Array<{ tablename: string }>
    >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

    for (const { tablename } of tables) {
        if (tablename !== '_prisma_migrations') {
            await prisma.$executeRawUnsafe(
                `TRUNCATE TABLE "public"."${tablename}" CASCADE;`
            );
        }
    }
}); 