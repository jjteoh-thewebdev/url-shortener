import request from 'supertest';
import { bootstrap } from '../app.js';

let app: any;

beforeAll(async () => {
    const { app: server } = await bootstrap(3002);
    await server.ready();
    app = server;
});

afterAll(async () => {
    await app.close();
});

describe(`Redirection API E2E`, () => {
    describe(`GET /:shortUrl`, () => {
        it(`should redirect to the long url`, async () => {
            const response = await request(app.server)
                .get('/test1')
                .expect(302);

            expect(response.header.location).toBe('https://example.com/test1');
        });

        it(`should return 404 for expired url`, async () => {
            const response = await request(app.server)
                .get('/test2')
                .expect(404);

            expect(response.body.error).toBe('url expired');
        });

        it(`should return password form for password protected url`, async () => {
            const response = await request(app.server)
                .get('/test3')
                .expect(200);

            expect(response.header['content-type']).toContain('text/html');
            expect(response.text).toContain('<form method="POST"');
        });

        it(`should return 404 for expired password protected url`, async () => {
            const response = await request(app.server)
                .get('/test4')
                .expect(404);

            expect(response.body.error).toBe('url expired');
        });
    });

    describe(`POST /:shortUrl`, () => {
        it(`should redirect to the long url`, async () => {
            const response = await request(app.server)
                .post('/test3')
                .send({ password: 'test123' })
                .expect(302);

            expect(response.header.location).toBe('https://example.com/test3');
        })

        it(`should return 401 for incorrect password`, async () => {
            const response = await request(app.server)
                .post('/test3')
                .send({ password: 'incorrect' })
                .expect(401);

            expect(response.body.error).toBe('Invalid Credentials');
        })

        it(`should return 404 for non-existent url`, async () => {
            const response = await request(app.server)
                .post('/nonexistent')
                .send({ password: 'test123' })
                .expect(404);

            expect(response.body.error).toBe('url not found');
        })

        it(`should return 400 for non-password protected url`, async () => {
            const response = await request(app.server)
                .post('/test1')
                .send({ password: 'test123' })
                .expect(400);

            expect(response.body.error).toBe(`Invalid Request`)
        })

        it(`should return 404 for expired password protected url`, async () => {
            const response = await request(app.server)
                .post('/test4')
                .send({ password: 'test123' })
                .expect(404);

            expect(response.body.error).toBe('url expired');
        })
    })
});