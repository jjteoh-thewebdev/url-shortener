import { FastifyInstance } from "fastify";
import { initORM } from "../../plugins/db.js";
import bcrypt from 'bcryptjs'; // esm friendly version of bcryptjs
import { Url } from "./url.entity.js";
import { readCache, writeToCache } from "../../plugins/redis.js";


export const registerUrlRoutes = async(app: FastifyInstance) => {
    const db = await initORM();
    const redis = app.redis

    app.get(`/:shortUrl`, async (request, reply) => {
        const { shortUrl } = request.params as { shortUrl: string };

        // Fetch the long url from redis first(cache aside pattern)
        const cacheKey = `shorturl:${shortUrl}`
        const cachedUrl = await readCache(redis, cacheKey)

        if(cachedUrl) {
            if (cachedUrl === `404`) {
                return reply.code(404).send({ error: `url not found` })
            } else if (cachedUrl === `400`) {
                return reply.code(400).send({ error: `url expired` })
            }

            // Update with raw sql to boost performance, reduce round trip to the database
            await db.em.execute(`UPDATE urls SET "visitorCount" = "visitorCount" + 1 WHERE "shortUrl" = '${shortUrl}'`)
            return reply.redirect(cachedUrl)
        }

        // Fetch the long url from the database
        const url = await db.url.findOneOrFail({ shortUrl })
        
        const validation = validateUrl(url)
        if(validation) {
            const {code, error} = validation

            // set the cache for 60 seconds(shorter ttl for invalid url aka negative cache)
            writeToCache(redis, cacheKey, code.toString(), 60)
            return reply.code(code).send({error})
        }
      

        // if the url is password protected, prompt password
        if(url.passwordHash) {
            // for simplicity, we dont count password prompt as a visit
            return reply.type('text/html').send(`
                <html>
                    <body>
                        <form method="POST" action="/${shortUrl}">
                            <label for="password">Enter Password:</label>
                            <input type="password" id="password" name="password" required />
                            <button type="submit">Submit</button>
                        </form>
                    </body>
                </html>
            `);
        }

        // set cache
        const cacheTtl = url.expiredAt ? Math.floor((url.expiredAt.getTime() - Date.now()) / 1000) : 60 * 60 // 1 hour
        writeToCache(redis, cacheKey, url.longUrl, cacheTtl)

        // increase visitor count before redirect
        url.visitorCount += 1n
        await db.em.flush()

        // redirect(fastify default is 302) to the long url
        return reply.redirect(url.longUrl);

    })
    
    

    // there are several ways to handle caching for a password protected url
    // e.g. cookies, session, etc.
    // for simplicity, we opt not to cache password protected url
    app.post(`/:shortUrl`, async (request, reply) => {
        const { shortUrl } = request.params as { shortUrl: string };
        const { password } = request.body as { password: string };

        const url = await db.url.findOneOrFail({shortUrl})

        const validation = validateUrl(url)
        if(validation) {
            const {code, error} = validation
            return reply.code(code).send({error})
        }

        // check if the password is correct
        if (password && url.passwordHash && !bcrypt.compareSync(password, url.passwordHash)) {
            return reply.code(401).send({error: `Invalid Credentials`})
        }

        // increase visitor count before redirect
        url.visitorCount += 1n
        await db.em.flush()

        // redirect(fastify default is 302) to the long url
        return reply.redirect(url.longUrl);
    })
}

const validateUrl = (url?: Url) => {
    // if url not found, return 404
    if(!url) {
        return {
            code: 404,
            error: `url not found`
        } 
    }

    // if url has expired, return 400
    if(url.expiredAt && url.expiredAt.getTime() < Date.now()) {
        return {
            code: 404,
            error: `url expired`
        }
    }

    return null
}

