import dotenv from 'dotenv';
import { bootstrap } from './app.js';
import { initTracing } from './lib/tracing.js';



try {
    dotenv.config();

    initTracing();

    const port = process.env.PORT || 3002;
    const host = process.env.HOST || '0.0.0.0';

    const { url } = await bootstrap(Number(port), host)
    console.log(`server started at ${url}`)

} catch (error) {
    console.error(error)
    process.exit(1)
}

