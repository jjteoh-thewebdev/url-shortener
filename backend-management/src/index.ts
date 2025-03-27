import dotenv from 'dotenv';
import { app } from './app';


dotenv.config();

const port = process.env.PORT || 3001;

export const server = app.listen(Number(port), () => {
    console.log(`Server is running on port ${port}`);
});