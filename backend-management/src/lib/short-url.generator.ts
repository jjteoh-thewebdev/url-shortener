export const generateShortUrl = async (id: bigint, domain = `http://localhost:3001`) => {
    // convert the id to base62(0-9, a-z, A-Z)
    const base62 = `0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ`;
    let shortUrl = ``;


    // note: bigint only supported in es2020
    // n suffices for bigint in es2020
    while (id > 0) {
        const remainder = id % 62n;

        // append the char to the front of the shortUrl
        shortUrl = base62[Number(remainder)] + shortUrl;

        // update id to the quotient for the next iteration
        id = id / 62n;
    }

    return domain + `/` + shortUrl;
}