import { FastifyInstance } from "fastify";
import { initORM } from "../../plugins/db.js";
import { redirectHandler } from "./handlers/redirect.handler.js";
import { redirectWithPasswordHandler } from "./handlers/redirect-with-password.handler.js";


export const registerUrlRoutes = async(app: FastifyInstance) => {
    const db = await initORM();
    const redis = app.redis

    app.get(`/:shortUrl`, async (request, reply) => {
        return await redirectHandler(request, reply, { db, redis })
    })

    app.post(`/:shortUrl`, async (request, reply) => {
        return await redirectWithPasswordHandler(request, reply, { db })
    })
}



