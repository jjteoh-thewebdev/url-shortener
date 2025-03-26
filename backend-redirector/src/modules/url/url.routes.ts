import { FastifyInstance } from "fastify";
import { initORM } from "../../plugins/db.js";
import bcrypt from 'bcryptjs'; // esm friendly version of bcryptjs
import { Url } from "./url.entity.js";
import { getString, setString } from "../../plugins/redis.js";

export const registerUrlRoutes = async(app: FastifyInstance) => {
    const db = await initORM();
    const redis = app.redis

    app.get(`/:shortUrl`, async (request, reply) => {
        const { shortUrl } = request.params as { shortUrl: string };


        // Fetch the long url from redis first(cache aside pattern)
        const cachedUrl = await getString(redis, shortUrl)

        if(cachedUrl) {
            // TODO: update count, return response, handle both valid and invalid url case
        }

        // Fetch the long url from the database
        const url = await db.url.findOneOrFail({shortUrl})
        
        const validation = validateUrl(url)
        if(validation) {
            const {code, error} = validation

            setString(redis, shortUrl, JSON.stringify(validation))
            return reply.code(code).send({error})
        }
      

        // if the url is password protected, prompt password
        if(url.passwordHash) {
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
        setString(redis, shortUrl, url.longUrl)

        // increase visitor count before redirect
        url.visitorCount += 1n
        await db.em.flush()

        // redirect(fastify default is 302) to the long url
        return reply.redirect(url.longUrl);

    })
    
    
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
        

        // set cache
        setString(redis, shortUrl, url.longUrl)
        
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