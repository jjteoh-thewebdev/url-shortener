import { Url } from "../url/url.entity.js"

export class AuthError extends Error {}

export const validateUrl = (url?: Url | null) => {
    // if url not found, return 404
    if (!url) {
        return {
            code: 404,
            error: `url not found`
        }
    }

    // if url has expired, return 400
    if (url.expiredAt && url.expiredAt.getTime() < Date.now()) {
        return {
            code: 404,
            error: `url expired`
        }
    }

    return null
}