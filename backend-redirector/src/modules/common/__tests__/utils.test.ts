import { validateUrl } from '../utils.js';
import { Url } from '../../url/url.entity.js';

describe('validateUrl', () => {
    it('should return 404 if URL is not found', () => {
        const result = validateUrl(undefined);
        expect(result).toEqual({
            code: 404,
            error: 'url not found'
        });
    });

    it('should return 404 if URL has expired', () => {
        const expiredUrl: Url = {
            id: 1n,
            shortUrl: 'abc123',
            longUrl: 'https://example.com',
            visitorCount: 0n,
            passwordHash: undefined,
            expiredAt: new Date(Date.now() - 1000), // 1 second ago
            createdAt: new Date()
        };

        const result = validateUrl(expiredUrl);
        expect(result).toEqual({
            code: 404,
            error: 'url expired'
        });
    });

    it('should return null if URL is valid and not expired', () => {
        const validUrl: Url = {
            id: 1n,
            shortUrl: 'abc123',
            longUrl: 'https://example.com',
            visitorCount: 0n,
            passwordHash: undefined,
            expiredAt: new Date(Date.now() + 1000), // 1 second from now
            createdAt: new Date()
        };

        const result = validateUrl(validUrl);
        expect(result).toBeNull();
    });

    it('should return null if URL has no expiry date', () => {
        const validUrl: Url = {
            id: 1n,
            shortUrl: 'abc123',
            longUrl: 'https://example.com',
            visitorCount: 0n,
            passwordHash: undefined,
            expiredAt: undefined,
            createdAt: new Date()
        };

        const result = validateUrl(validUrl);
        expect(result).toBeNull();
    });

    it('should return null if URL is valid and expiredAt is in the future', () => {
        const validUrl: Url = {
            id: 1n,
            shortUrl: 'abc123',
            longUrl: 'https://example.com',
            visitorCount: 0n,
            passwordHash: undefined,
            expiredAt: new Date(Date.now() + 86400000), // 1 day from now
            createdAt: new Date()
        };

        const result = validateUrl(validUrl);
        expect(result).toBeNull();
    });
}); 