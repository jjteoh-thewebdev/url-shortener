import request from 'supertest';
import { bootstrap } from '../app.js';

let app: any;

beforeAll(async () => {
    const { app: server } = await bootstrap(3002);
    app = server;
});

afterAll(async () => {
    await app.close();
});

describe(`Redirection API E2E`, () => {
    describe(`GET /:shortUrl`, () => {
        it(`should redirect to the long url`, async () => {
            const response = await request(app)
                .get('/test1')
                .expect(302);

            expect(response.header.location).toBe('https://example.com/test1');
        });

        // it(`should return 404 for expired url`, async () => {
        //     const response = await request(app)
        //         .get('/test2')
        //         .expect(404);

        //     expect(response.body.error).toBe('url expired');
        // });

        // it(`should return password form for password protected url`, async () => {
        //     const response = await request(app)
        //         .get('/test3')
        //         .expect(200);

        //     expect(response.header['content-type']).toContain('text/html');
        //     expect(response.text).toContain('<form method="POST"');
        // });

        // it(`should return 404 for expired password protected url`, async () => {
        //     const response = await request(app)
        //         .get('/test4')
        //         .expect(404);

        //     expect(response.body.error).toBe('url expired');
        // });
    });

    // describe(`POST /:shortUrl`, () => {})
});