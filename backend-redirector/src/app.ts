import fastify from "fastify";
import { initORM } from "./plugins/db.js";
import { NotFoundError, RequestContext } from "@mikro-orm/core";
import { AuthError } from "./modules/common/utils.js";
import { registerUrlRoutes } from "./modules/url/url.routes.js";
import { url } from "inspector";
import formBody from '@fastify/formbody' 
import redisPlugin from './plugins/redis.js';

export async function bootstrap(port = 3001) {
    const db = await initORM()

    // we let prisma handle migrations in backend-management service
    // if(migrate) {
    //     await db.orm.migrator.up()
    // }

    const app = fastify()

    // support x-www-urlencoded
    await app.register(formBody)

    // register redis
    app.register(redisPlugin, {
        url: process.env.REDIS_URL
    })

    // inject entity manager
    app.addHook(`onRequest`, (req, reply, done) => {
        RequestContext.create(db.em, done)
    })

    // shutdown connection gracefully
    app.addHook(`onClose`, async() => {
        await db.orm.close()
    })

    // register global error handler to process 404 errors from `findOneOrFail` calls
    app.setErrorHandler((error, request, reply) => {
        if (error instanceof AuthError) {
        return reply.status(401).send({ error: error.message });
        }

        if (error instanceof NotFoundError) {
        return reply.status(404).send({ error: error.message });
        }

        app.log.error(error);
        reply.status(500).send({ error: error.message });
    });

    // register route handlers
    app.register(registerUrlRoutes)

    app.get(`/`, async (request, reply) => {
        return `Helllo World`
    })


    const ur = await app.listen({ port: Number(port) }, (err, address) => {
        if (err) {
            console.error(err)
            process.exit(1)
        }
        console.log(`Server listening at ${address}`)
    })


    return {app, url}
}