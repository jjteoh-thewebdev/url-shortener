import { validateUrl } from "../../common/utils.js";
import { Services } from "../../../plugins/db.js";
import { readCache, writeToCache } from "../../../plugins/redis.js";
import { FastifyReply, FastifyRequest } from "fastify";
import * as Redis from "ioredis";

export const redirectHandler = async (request: FastifyRequest, reply: FastifyReply, { db, redis }: { db: Services, redis: Redis.Redis }) => {
    const { shortUrl } = request.params as { shortUrl: string };

    // Fetch the long url from redis first(cache aside pattern)
    const cacheKey = `shorturl:${shortUrl}`
    const cachedUrl = await readCache(redis, cacheKey)

    if (cachedUrl) {
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
    const url = await db.url.findOne({ shortUrl })

    const validation = validateUrl(url)
    if (validation) {
        const { code, error } = validation

        // set the cache for 60 seconds(shorter ttl for invalid url aka negative cache)
        writeToCache(redis, cacheKey, code.toString(), 60)
        return reply.code(code).send({ error })
    }


    // if the url is password protected, prompt password
    if (url!.passwordHash) {
        // for simplicity, we dont count password prompt as a visit
        return reply.type('text/html').send(`
                <html>
                    <body>
                        <form method="POST" action="/${shortUrl}">
                            <label for="password">Enter Password:</label>
                            <input data-testid="password-input" type="password" id="password" name="password" required />
                            <button data-testid="password-submit-button" type="submit">Submit</button>
                        </form>
                    </body>
                </html>
            `);
    }

    // set cache
    let cacheTtl = 60 * 60 // 1 hour
    if (url!.expiredAt) {
        const timeLeftBeforeExpired = Math.floor((url!.expiredAt.getTime() - Date.now()) / 1000)
        writeToCache(redis, cacheKey, url!.longUrl, timeLeftBeforeExpired < cacheTtl ? timeLeftBeforeExpired : cacheTtl)
    } else {
        writeToCache(redis, cacheKey, url!.longUrl, cacheTtl)
    }

    // increase visitor count before redirect
    url!.visitorCount += 1n
    await db.em.flush()

    // redirect(fastify default is 302) to the long url
    return reply.redirect(url!.longUrl);

}