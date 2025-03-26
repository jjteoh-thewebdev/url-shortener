import dotenv from 'dotenv';
import { bootstrap } from './app.js';



try {
    dotenv.config();

    const port = process.env.PORT || 3002;

    const { url } = await bootstrap(Number(port))
    console.log(`server started at ${url}`)

} catch (error) {
    console.error(error)
}

