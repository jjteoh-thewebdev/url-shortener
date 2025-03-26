import dotenv from 'dotenv';
import { bootstrap } from './app.js';



try {
    dotenv.config();

    console.log("database", process.env.DATABASE_URL)

    const port = process.env.PORT || 3002;

    const { url } = await bootstrap(Number(port))
    console.log(`server started at ${url}`)

} catch (error) {
    console.error(error)
}

