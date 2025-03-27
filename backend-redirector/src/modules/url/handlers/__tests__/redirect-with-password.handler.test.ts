import { FastifyRequest, FastifyReply } from 'fastify';
import { redirectWithPasswordHandler } from '../redirect-with-password.handler.js';
import bcrypt from 'bcryptjs';
import { validateUrl } from '../../../common/utils.js';
import { initORM } from '../../../../plugins/db.js';


// Mock dependencies
jest.mock('bcryptjs', () => ({
    compareSync: jest.fn()
}));

jest.mock('../../../common/utils.js', () => ({
    validateUrl: jest.fn()
}));

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

describe('redirectWithPasswordHandler', () => {
    let mockRequest: FastifyRequest;
    let mockReply: FastifyReply;
    let mockDb: any;
    const shortUrl = 'abc123';
    const longUrl = 'https://example.com';

    beforeEach(async () => {
        // Reset all mocks
        jest.clearAllMocks();


        // Setup mock request and reply
        mockRequest = {
            params: { shortUrl },
            body: { password: 'test_password' }
        } as unknown as FastifyRequest;

        mockReply = {
            redirect: jest.fn(),
            code: jest.fn().mockReturnThis(),
            send: jest.fn(),
            type: jest.fn().mockReturnThis(),
        } as unknown as FastifyReply;

        mockDb = await initORM();
    });

    it('should redirect if password is correct', async () => {
        // Mock database hit with password
        mockDb.url.findOne.mockResolvedValue({
            shortUrl: 'abc123',
            longUrl: 'https://example.com',
            passwordHash: 'hashed_password',
            visitorCount: 0n
        });

        // Mock password verification
        (bcrypt.compareSync as jest.Mock).mockReturnValue(true);
        (validateUrl as jest.Mock).mockReturnValue(null);

        // Act
        await redirectWithPasswordHandler(mockRequest as FastifyRequest, mockReply as FastifyReply, { db: mockDb });

        // Assert
        expect(validateUrl).toHaveBeenCalled();
        expect(mockDb.url.findOne).toHaveBeenCalled();

        expect(bcrypt.compareSync).toHaveBeenCalledWith('test_password', 'hashed_password');
        expect(mockDb.em.flush).toHaveBeenCalled();
        expect(mockReply.redirect).toHaveBeenCalledWith('https://example.com');
    });

    it('should return 401 if password is incorrect', async () => {
        // Mock database hit with password
        mockDb.url.findOne.mockResolvedValue({
            shortUrl: 'abc123',
            longUrl: 'https://example.com',
            passwordHash: 'hashed_password',
            visitorCount: 0n
        });

        // Mock password verification
        (bcrypt.compareSync as jest.Mock).mockReturnValue(false);
        (validateUrl as jest.Mock).mockReturnValue(null);

        // Act
        await redirectWithPasswordHandler(mockRequest as FastifyRequest, mockReply as FastifyReply, { db: mockDb });

        // Assert
        expect(validateUrl).toHaveBeenCalled();
        expect(mockDb.url.findOne).toHaveBeenCalled();

        expect(mockReply.code).toHaveBeenCalledWith(401);
        expect(mockReply.send).toHaveBeenCalledWith({ error: 'Invalid Credentials' });
    });

    it('should return 404 if URL not found', async () => {
        // Mock database miss
        mockDb.url.findOne.mockResolvedValue(null);
        (validateUrl as jest.Mock).mockReturnValue({ code: 404, error: 'url not found' });

        await redirectWithPasswordHandler(mockRequest as FastifyRequest, mockReply as FastifyReply, { db: mockDb });

        expect(mockDb.url.findOne).toHaveBeenCalled();
        expect(validateUrl).toHaveBeenCalled();

        expect(mockReply.code).toHaveBeenCalledWith(404);
        expect(mockReply.send).toHaveBeenCalledWith({ error: 'url not found' });
    });

    it('should handle expired URLs', async () => {
        // Mock database hit with expired URL
        const expiredUrl = {
            shortUrl: 'abc123',
            longUrl: 'https://example.com',
            expiredAt: new Date(Date.now() - 1000), // 1 second ago
            passwordHash: 'hashed_password',
            visitorCount: 0n
        };
        mockDb.url.findOne.mockResolvedValue(expiredUrl);
        (validateUrl as jest.Mock).mockReturnValue({ code: 404, error: 'url expired' });

        await redirectWithPasswordHandler(mockRequest as FastifyRequest, mockReply as FastifyReply, { db: mockDb });

        expect(validateUrl).toHaveBeenCalled();
        expect(mockDb.url.findOne).toHaveBeenCalled();

        expect(mockReply.code).toHaveBeenCalledWith(404);
        expect(mockReply.send).toHaveBeenCalledWith({ error: 'url expired' });
    });

    it('should handle missing password in request body', async () => {
        // Mock request without password
        mockRequest.body = {};

        // Mock database hit with password
        mockDb.url.findOne.mockResolvedValue({
            shortUrl: 'abc123',
            longUrl: 'https://example.com',
            passwordHash: 'hashed_password',
            visitorCount: 0n
        });
        (validateUrl as jest.Mock).mockReturnValue(null);


        await redirectWithPasswordHandler(mockRequest as FastifyRequest, mockReply as FastifyReply, { db: mockDb });

        expect(validateUrl).toHaveBeenCalled();

        expect(mockReply.code).toHaveBeenCalledWith(400);
        expect(mockReply.send).toHaveBeenCalledWith({ error: 'Invalid Request' });
    });
}); 