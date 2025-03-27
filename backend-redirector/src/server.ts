import dotenv from 'dotenv';
import { bootstrap } from './app.js';



try {
    dotenv.config();

    const port = process.env.PORT || 3002;
    const host = process.env.HOST || '0.0.0.0';

    const { url } = await bootstrap(Number(port), host)
    console.log(`server started at ${url}`)

} catch (error) {
    console.error(error)
    process.exit(1)
}

