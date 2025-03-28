import { validateUrl } from "../../common/utils.js";
import { Services } from "../../../plugins/db.js";
import bcrypt from "bcryptjs";
import { FastifyReply, FastifyRequest } from "fastify";

// there are several ways to handle caching for a password protected url
// e.g. cookies, session, etc.
// for simplicity, we opt not to cache password protected url
export const redirectWithPasswordHandler = async (request: FastifyRequest, reply: FastifyReply, { db }: { db: Services }) => {
    const { shortUrl } = request.params as { shortUrl: string };
    const { password } = request.body as { password: string };

    const url = await db.url.findOne({ shortUrl })

    const validation = validateUrl(url)
    if (validation) {
        const { code, error } = validation
        return reply.code(code).send({ error })
    }

    // if the url is not password protected, return 400
    if (!url?.passwordHash || !password) {
        return reply.code(400).send({ error: `Invalid Request` })
    }

    // check if the password is correct
    if (!bcrypt.compareSync(password, url!.passwordHash)) {
        return reply.code(401).send({ error: `Invalid Credentials` })
    }

    // increase visitor count before redirect
    url!.visitorCount += 1n
    await db.em.flush()

    // redirect(fastify default is 302) to the long url
    return reply.redirect(url!.longUrl);
}