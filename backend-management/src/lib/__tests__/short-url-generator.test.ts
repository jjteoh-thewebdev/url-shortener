import { generateShortUrl } from '../../lib/short-url.generator';

describe('Short URL Generator', () => {
    it('should generate a 7-character string for ID 0', async () => {
        const result = await generateShortUrl(0n);
        expect(result).toEqual('0000000');
        expect(result.length).toBe(7);
    });

    it('should generate correct short URL', async () => {
        const result1 = await generateShortUrl(1n);
        expect(result1).toEqual('0000001');

        const result12 = await generateShortUrl(12n);
        expect(result12).toEqual('000000c');

        const result61 = await generateShortUrl(61n);
        expect(result61).toEqual('000000Z');

        const result125 = await generateShortUrl(125n);
        expect(result125).toEqual('0000021');

        // Testing with a large ID (approximately 3.8 trillion)
        const largeId = 3844363989857n;
        const resultLargeId = await generateShortUrl(largeId);
        expect(resultLargeId).toEqual('15Gijwo9');

        // Testing with a very large ID (approximately 3.8 quadrillion)
        const veryLargeId = 3844363989857000n;
        const resultVeryLargeId = await generateShortUrl(veryLargeId);
        expect(resultVeryLargeId).toEqual('hBEboSpra');
    });
}); 