import request from 'supertest';
import { app } from '../app';

describe('/urls API E2E', () => {
    describe(`POST /api/v1/urls/shorten`, () => {
        it('should create a new URL and retrieve it', async () => {
            // Create a new URL
            const createResponse = await request(app)
                .post('/api/v1/urls/shorten')
                .send({
                    long_url: 'https://example.com',
                    custom_url: 'test123',
                    password: 'secret123',
                    expiry: new Date(Date.now() + 86400000) // 1 day from now
                })
                .expect(200);

            expect(createResponse.body.error).toBeNull();
            expect(createResponse.body.data).toMatchObject({
                short_url: 'test123', // custom_url
                long_url: 'https://example.com',
                has_password: true,
                visitor_count: '0'
            });
        });

        it('should handle URL creation with password protection', async () => {
            // Create a password-protected URL
            const createResponse = await request(app)
                .post('/api/v1/urls/shorten')
                .send({
                    long_url: 'https://example.com',
                    password: 'secret123'
                })
                .expect(200);

            expect(createResponse.body.error).toBeNull();
            expect(createResponse.body.data.has_password).toBe(true);
        });
    });
}); 
