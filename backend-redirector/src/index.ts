import fastify from 'fastify'
import dotenv from 'dotenv';
import { redirectUrl, redirectUrlWithPassword } from './routes/urls';

dotenv.config();
const server = fastify()

const port = process.env.PORT || 3002;

server.get(`/`, async (request, reply) => {
    return `Helllo World`
})

server.get(`/ping`, async (request, reply) => {
    return `Pong`
})


server.get(`/:shortUrl`, async (request, reply) => {
    await redirectUrl(request, reply);
})


server.post(`/:shortUrl/password`, async (request, reply) => {
    await redirectUrlWithPassword(request, reply);
})

server.listen({ port: Number(port) }, (err, address) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log(`Server listening at ${address}`)
})