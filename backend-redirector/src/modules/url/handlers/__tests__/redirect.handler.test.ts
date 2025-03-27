import { FastifyReply, FastifyRequest } from 'fastify';
import { redirectHandler } from '../redirect.handler.js';
import { initORM } from '../../../../plugins/db.js';
import { readCache, writeToCache } from '../../../../plugins/redis.js';
import { validateUrl } from '../../../common/utils.js';
import * as Redis from 'ioredis';


// Mock the database and redis plugins
jest.mock('../../../../plugins/db.js', () => ({
    initORM: jest.fn().mockResolvedValue({
        em: {
            execute: jest.fn(),
            flush: jest.fn()
        },
        url: {
            findOne: jest.fn(),
        }
    })
}));

jest.mock('../../../../plugins/redis.js', () => ({
    readCache: jest.fn(),
    writeToCache: jest.fn()
}));

jest.mock('../../../common/utils.js', () => ({
    validateUrl: jest.fn()
}));

describe('redirectHandler', () => {
    let mockRequest: FastifyRequest;
    let mockReply: FastifyReply;
    let mockDb: any;
    let mockRedis: Redis.Redis;
    const shortUrl = 'abc123';
    const longUrl = 'https://example.com';

    beforeEach(async () => {
        // Reset all mocks before each test
        jest.clearAllMocks();

        // Setup mock request and reply
        mockRequest = {
            params: { shortUrl }
        } as unknown as FastifyRequest;

        mockReply = {
            redirect: jest.fn(),
            code: jest.fn().mockReturnThis(),
            send: jest.fn(),
            type: jest.fn().mockReturnThis(),
        } as unknown as FastifyReply;

        mockRedis = {
            get: jest.fn(),
            set: jest.fn()
        } as unknown as Redis.Redis;

        mockDb = await initORM();
    });

    it('should return cached URL if available', async () => {
        // Mock Redis to return cached URL
        (readCache as jest.Mock).mockResolvedValue(longUrl);

        // const mockDb = await initORM();
        await redirectHandler(mockRequest, mockReply, { db: mockDb, redis: {} as any });

        expect(readCache).toHaveBeenCalledWith({} as any, `shorturl:${shortUrl}`);
        expect(mockDb.em.execute).toHaveBeenCalled();
        expect(mockReply.redirect).toHaveBeenCalledWith(longUrl);
    });

    it('should return 404 if URL not found in cache and database', async () => {
        // Mock cache miss
        (readCache as jest.Mock).mockResolvedValue(null);

        // Mock database miss
        // mockDb = await initORM();
        mockDb.url.findOne.mockResolvedValue(null);
        (validateUrl as jest.Mock).mockReturnValue({ code: 404, error: 'url not found' });

        await redirectHandler(mockRequest, mockReply, { db: mockDb, redis: {} as any });

        // check if cache is missed
        expect(readCache).toHaveBeenCalledWith({} as any, `shorturl:${shortUrl}`);
        // check if database is hit
        expect(mockDb.url.findOne).toHaveBeenCalled();
        expect(validateUrl).toHaveBeenCalled();

        // check if 404 is returned
        expect(mockReply.code).toHaveBeenCalledWith(404);
        expect(mockReply.send).toHaveBeenCalledWith({ error: 'url not found' });
    });

    it('should return password form if URL is password protected', async () => {
        // Mock cache miss
        (readCache as jest.Mock).mockResolvedValue(null);

        // Mock database hit with password
        mockDb.url.findOne.mockResolvedValue({
            shortUrl: 'abc123',
            longUrl: 'https://example.com',
            passwordHash: 'hashed_password'
        });

        (validateUrl as jest.Mock).mockReturnValue(null);


        await redirectHandler(mockRequest as FastifyRequest, mockReply as FastifyReply, { db: mockDb, redis: mockRedis });

        expect(readCache).toHaveBeenCalledWith(mockRedis, `shorturl:${shortUrl}`);
        expect(mockDb.url.findOne).toHaveBeenCalled();
        expect(validateUrl).toHaveBeenCalled();
        expect(mockReply.type).toHaveBeenCalledWith('text/html');
        expect(mockReply.send).toHaveBeenCalled();
    });

    it('should handle expired URLs', async () => {
        // Mock cache miss
        (readCache as jest.Mock).mockResolvedValue(null);
        // Mock database hit with expired URL
        const expiredUrl = {
            shortUrl: 'abc123',
            longUrl: 'https://example.com',
            expiredAt: new Date(Date.now() - 1000) // 1 second ago
        };
        mockDb.url.findOne.mockResolvedValue(expiredUrl);
        (validateUrl as jest.Mock).mockReturnValue({ code: 404, error: 'url expired' });

        await redirectHandler(mockRequest as FastifyRequest, mockReply as FastifyReply, { db: mockDb, redis: mockRedis });

        expect(readCache).toHaveBeenCalledWith(mockRedis, `shorturl:${shortUrl}`);
        expect(mockDb.url.findOne).toHaveBeenCalled();
        expect(validateUrl).toHaveBeenCalled();
        // check if cache is set for 60 seconds
        expect(writeToCache).toHaveBeenCalledWith(mockRedis, `shorturl:${shortUrl}`, '404', 60);
        expect(mockReply.code).toHaveBeenCalledWith(404);
        expect(mockReply.send).toHaveBeenCalledWith({ error: 'url expired' });
    });

    it('should update visitor count and cache on successful redirect', async () => {
        // Mock cache miss
        (readCache as jest.Mock).mockResolvedValue(null);
        // Mock database hit
        const url = {
            shortUrl: 'abc123',
            longUrl: 'https://example.com',
            visitorCount: 0n
        };
        mockDb.url.findOne.mockResolvedValue(url);
        (validateUrl as jest.Mock).mockReturnValue(null);

        await redirectHandler(mockRequest as FastifyRequest, mockReply as FastifyReply, { db: mockDb, redis: mockRedis });

        expect(readCache).toHaveBeenCalledWith(mockRedis, `shorturl:${shortUrl}`);
        expect(mockDb.url.findOne).toHaveBeenCalled();
        expect(validateUrl).toHaveBeenCalled();

        // check if cache is set for 1 hour
        expect(writeToCache).toHaveBeenCalledWith(mockRedis, `shorturl:${shortUrl}`, 'https://example.com', 60 * 60);
        // check if visitor count is updated
        expect(mockDb.em.flush).toHaveBeenCalled();
        expect(mockReply.redirect).toHaveBeenCalledWith('https://example.com');
    });

    it('should update visitor count and cache(with time left before expired if less than default ttl) on successful redirect', async () => {
        // Mock cache miss
        (readCache as jest.Mock).mockResolvedValue(null);
        // Mock database hit with expired URL
        const expiredUrl = {
            shortUrl: 'abc123',
            longUrl: 'https://example.com',
            expiredAt: new Date(Date.now() + 10000), // 10 seconds from now,
            visitorCount: 0n

        };
        mockDb.url.findOne.mockResolvedValue(expiredUrl);
        (validateUrl as jest.Mock).mockReturnValue(null);

        await redirectHandler(mockRequest as FastifyRequest, mockReply as FastifyReply, { db: mockDb, redis: mockRedis });


        expect(readCache).toHaveBeenCalledWith(mockRedis, `shorturl:${shortUrl}`);
        expect(mockDb.url.findOne).toHaveBeenCalled();
        expect(validateUrl).toHaveBeenCalled();
        // check if cache is set for 10 seconds
        expect(writeToCache).toHaveBeenCalledWith(mockRedis, `shorturl:${shortUrl}`, 'https://example.com', 10);
        // check if visitor count is updated
        expect(mockDb.em.flush).toHaveBeenCalled();
        expect(mockReply.redirect).toHaveBeenCalledWith('https://example.com');
    });
}); 