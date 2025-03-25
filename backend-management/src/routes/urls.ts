import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";
import { ShortenUrlRequest } from "../dtos/shorten-url.request";
import { StatusCodes } from "http-status-codes";
import { generateShortUrl } from "../lib/short-url.generator";

const saltRounds = 10;

export async function shortenUrl(req: Request, res: Response) {
    try {
        const { long_url, custom_url, password, expiry } = req.body as ShortenUrlRequest;

        // If custom_url is provided, check if it already exists
        // We offload this to the database(with a unique index) to avoid race conditions
        // alternatively, we could use bloom filters to check for collisions
        if (custom_url) {
            const existingUrl = await prisma.url.findUnique({
                where: { shortUrl: custom_url },
                select: { shortUrl: true }
            });

            if (existingUrl) {
                return res.status(StatusCodes.CONFLICT).json({
                    error: "Custom URL already exists",
                    data: null
                });
            }
        }

        // Hash password if provided
        let passwordHash: string | undefined;
        if (password) {
            passwordHash = await bcrypt.hash(password, saltRounds);
        }

        // Create new URL record
        // We use the custom_url if provided, 
        // otherwise we insert a new record with null then only we use the generated id to generate the short url with base62 encoding
        // Alternatively, we can setup another service that will insert the records beforehand and then we can just use the generated id
        let url = await prisma.url.create({
            data: {
                shortUrl: custom_url, // If custom_url is not provided
                longUrl: long_url,
                passwordHash,
                expiredAt: expiry,
            }
        });

        if (url.shortUrl === null) {
            const domain = process.env.DOMAIN || `http://localhost:3001`;
            const shortUrl = await generateShortUrl(url.id, domain);
            url = await prisma.url.update({
                where: { id: url.id },
                data: { shortUrl }
            });
        }

        return res.status(StatusCodes.OK).json({
            error: null,
            data: {
                short_url: url.shortUrl
            }
        });

    } catch (error) {
        console.error('Error in shortenUrl:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: "Failed to create short URL",
            data: null
        });
    }
}