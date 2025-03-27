import { Request, Response } from 'express';
import { shortenUrl } from '../urls';
import { prisma } from '../../lib/prisma';
import bcrypt from 'bcrypt';
import { generateShortUrl } from '../../lib/short-url.generator';

// Mock dependencies
jest.mock('../../lib/prisma', () => ({
    prisma: {
        url: {
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn()
        }
    }
}));

jest.mock('bcrypt', () => ({
    hash: jest.fn()
}));

jest.mock('../../lib/short-url.generator', () => ({
    generateShortUrl: jest.fn()
}));

describe('shortenUrl function', () => {
    // Create mock request and response objects
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Setup response mock with chaining
        jsonMock = jest.fn().mockReturnThis();
        statusMock = jest.fn().mockReturnValue({ json: jsonMock });

        mockRequest = {
            body: {}
        };

        mockResponse = {
            status: statusMock,
            json: jsonMock
        };
    });

    it('should create a short URL with auto-generated ID when custom URL is not provided', async () => {
        // Mock request data
        mockRequest.body = {
            long_url: 'https://example.com',
            custom_url: undefined,
            password: undefined,
            expiry: undefined
        };

        // Mock prisma responses
        const mockCreatedUrl = {
            id: 12345n,
            shortUrl: null,
            longUrl: 'https://example.com',
            visitorCount: 0n,
            passwordHash: null,
            expiredAt: null,
            createdAt: new Date()
        };

        const mockUpdatedUrl = {
            ...mockCreatedUrl,
            shortUrl: 'abc123'
        };

        (prisma.url.create as jest.Mock).mockResolvedValue(mockCreatedUrl);
        (prisma.url.update as jest.Mock).mockResolvedValue(mockUpdatedUrl);
        (generateShortUrl as jest.Mock).mockResolvedValue('abc123');

        // Call the function
        await shortenUrl(mockRequest as Request, mockResponse as Response);

        // Assert prisma create was called with correct data
        expect(prisma.url.create).toHaveBeenCalledWith({
            data: {
                shortUrl: undefined,
                longUrl: 'https://example.com',
                passwordHash: undefined,
                expiredAt: undefined
            }
        });

        // Assert generateShortUrl was called with correct ID
        expect(generateShortUrl).toHaveBeenCalledWith(12345n);

        // Assert prisma update was called with correct data
        expect(prisma.url.update).toHaveBeenCalledWith({
            where: { id: 12345n },
            data: { shortUrl: 'abc123' }
        });

        // Assert response
        expect(statusMock).toHaveBeenCalledWith(200);
        expect(jsonMock).toHaveBeenCalledWith({
            error: null,
            data: {
                id: '12345',
                short_url: 'abc123',
                long_url: 'https://example.com',
                visitor_count: '0',
                has_password: false,
                expired_at: null,
                created_at: expect.any(Date)
            }
        });
    });

    it('should use custom URL if provided', async () => {
        // Mock request data
        mockRequest.body = {
            long_url: 'https://example.com',
            custom_url: 'custom123',
            password: undefined,
            expiry: undefined
        };

        // Mock prisma findUnique to return null (no conflict)
        (prisma.url.findUnique as jest.Mock).mockResolvedValue(null);

        // Mock prisma create response
        const mockCreatedUrl = {
            id: 12345n,
            shortUrl: 'custom123',
            longUrl: 'https://example.com',
            visitorCount: 0n,
            passwordHash: null,
            expiredAt: null,
            createdAt: new Date()
        };

        (prisma.url.create as jest.Mock).mockResolvedValue(mockCreatedUrl);

        // Call the function
        await shortenUrl(mockRequest as Request, mockResponse as Response);

        // Assert prisma findUnique was called to check for existing URL
        expect(prisma.url.findUnique).toHaveBeenCalledWith({
            where: { shortUrl: 'custom123' },
            select: { shortUrl: true }
        });

        // Assert prisma create was called with correct data
        expect(prisma.url.create).toHaveBeenCalledWith({
            data: {
                shortUrl: 'custom123',
                longUrl: 'https://example.com',
                passwordHash: undefined,
                expiredAt: undefined
            }
        });

        // Assert generateShortUrl was NOT called since custom URL was provided
        expect(generateShortUrl).not.toHaveBeenCalled();

        // Assert prisma update was NOT called since custom URL was provided
        expect(prisma.url.update).not.toHaveBeenCalled();

        // Assert response
        expect(statusMock).toHaveBeenCalledWith(200);
        expect(jsonMock).toHaveBeenCalledWith({
            error: null,
            data: {
                id: '12345',
                short_url: 'custom123',
                long_url: 'https://example.com',
                visitor_count: '0',
                has_password: false,
                expired_at: null,
                created_at: expect.any(Date)
            }
        });
    });

    it('should return conflict error if custom URL already exists', async () => {
        // Mock request data
        mockRequest.body = {
            long_url: 'https://example.com',
            custom_url: 'existing123',
            password: undefined,
            expiry: undefined
        };

        // Mock prisma findUnique to return an existing URL
        (prisma.url.findUnique as jest.Mock).mockResolvedValue({
            shortUrl: 'existing123'
        });

        // Call the function
        await shortenUrl(mockRequest as Request, mockResponse as Response);

        // Assert prisma create was NOT called
        expect(prisma.url.create).not.toHaveBeenCalled();

        // Assert response
        expect(statusMock).toHaveBeenCalledWith(409);
        expect(jsonMock).toHaveBeenCalledWith({
            error: 'Custom URL already exists',
            data: null
        });
    });

    it('should hash password if provided', async () => {
        // Mock request data
        mockRequest.body = {
            long_url: 'https://example.com',
            custom_url: undefined,
            password: 'secret123',
            expiry: undefined
        };

        // Mock bcrypt.hash
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password_123');

        // Mock prisma responses
        const mockCreatedUrl = {
            id: 12345n,
            shortUrl: null,
            longUrl: 'https://example.com',
            visitorCount: 0n,
            passwordHash: 'hashed_password_123',
            expiredAt: null,
            createdAt: new Date()
        };

        const mockUpdatedUrl = {
            ...mockCreatedUrl,
            shortUrl: 'abc123'
        };

        (prisma.url.create as jest.Mock).mockResolvedValue(mockCreatedUrl);
        (prisma.url.update as jest.Mock).mockResolvedValue(mockUpdatedUrl);
        (generateShortUrl as jest.Mock).mockResolvedValue('abc123');

        // Call the function
        await shortenUrl(mockRequest as Request, mockResponse as Response);

        // Assert bcrypt.hash was called
        expect(bcrypt.hash).toHaveBeenCalledWith('secret123', 10);

        // Assert prisma create was called with hashed password
        expect(prisma.url.create).toHaveBeenCalledWith({
            data: {
                shortUrl: undefined,
                longUrl: 'https://example.com',
                passwordHash: 'hashed_password_123',
                expiredAt: undefined
            }
        });

        // Assert response
        expect(statusMock).toHaveBeenCalledWith(200);
        expect(jsonMock).toHaveBeenCalledWith({
            error: null,
            data: {
                id: '12345',
                short_url: 'abc123',
                long_url: 'https://example.com',
                visitor_count: '0',
                has_password: true,
                expired_at: null,
                created_at: expect.any(Date)
            }
        });
    });

    it('should handle expiry date if provided', async () => {
        // Mock request data
        const expiryDate = new Date(Date.now() + 86400000); // 1 day from now
        mockRequest.body = {
            long_url: 'https://example.com',
            custom_url: undefined,
            password: undefined,
            expiry: expiryDate
        };

        // Mock prisma responses
        const mockCreatedUrl = {
            id: 12345n,
            shortUrl: null,
            longUrl: 'https://example.com',
            visitorCount: 0n,
            passwordHash: null,
            expiredAt: expiryDate,
            createdAt: new Date()
        };

        const mockUpdatedUrl = {
            ...mockCreatedUrl,
            shortUrl: 'abc123'
        };

        (prisma.url.create as jest.Mock).mockResolvedValue(mockCreatedUrl);
        (prisma.url.update as jest.Mock).mockResolvedValue(mockUpdatedUrl);
        (generateShortUrl as jest.Mock).mockResolvedValue('abc123');

        // Call the function
        await shortenUrl(mockRequest as Request, mockResponse as Response);

        // Assert prisma create was called with expiry date
        expect(prisma.url.create).toHaveBeenCalledWith({
            data: {
                shortUrl: undefined,
                longUrl: 'https://example.com',
                passwordHash: undefined,
                expiredAt: expiryDate
            }
        });

        // Assert response
        expect(statusMock).toHaveBeenCalledWith(200);
        expect(jsonMock).toHaveBeenCalledWith({
            error: null,
            data: {
                id: '12345',
                short_url: 'abc123',
                long_url: 'https://example.com',
                visitor_count: '0',
                has_password: false,
                expired_at: expiryDate,
                created_at: expect.any(Date)
            }
        });
    });

    it('should handle server errors gracefully', async () => {
        // Mock request data
        mockRequest.body = {
            long_url: 'https://example.com',
            custom_url: undefined,
            password: undefined,
            expiry: undefined
        };

        // Mock prisma to throw an error
        (prisma.url.create as jest.Mock).mockRejectedValue(new Error('Database error'));

        // Mock console.error to avoid polluting test output
        jest.spyOn(console, 'error').mockImplementation(() => { });

        // Call the function
        await shortenUrl(mockRequest as Request, mockResponse as Response);

        // Assert response
        expect(statusMock).toHaveBeenCalledWith(500);
        expect(jsonMock).toHaveBeenCalledWith({
            error: 'Failed to create short URL',
            data: null
        });
    });
}); 