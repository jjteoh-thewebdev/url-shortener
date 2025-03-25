import { FastifyReply, FastifyRequest } from "fastify";

export const redirectUrl = async (request: FastifyRequest, reply: FastifyReply) => {
    const { shortUrl } = request.params as { shortUrl: string };


    // Fetch the long url from the database

    // if url not found, return 404

    // if url has expired, return 400

    // if the url is password protected, return login page

    // redirect to the long url


    throw new Error('Not implemented');
}

export const redirectUrlWithPassword = async (request: FastifyRequest, reply: FastifyReply) => {
    const { shortUrl, password } = request.params as { shortUrl: string, password: string };

    // check if the password is correct

    // check if the url has expired

    // if the password is correct, redirect to the long url 

    // if the password is incorrect, return 401

    throw new Error('Not implemented');
}   