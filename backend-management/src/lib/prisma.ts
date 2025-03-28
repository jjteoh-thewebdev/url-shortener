import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
    log: ['error', 'warn'],
    // Configure connection pooling
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
    // Set connection pool size based on your needs
    // This is a good starting point for high-traffic applications
    // connection: {
    //     pool: {
    //         min: 2, // Minimum number of connections
    //         max: 10, // Maximum number of connections
    //         idleTimeoutMillis: 30000, // How long a connection can be idle before being closed
    //     },
    // },
});

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
} 