import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import { validateData } from './middlewares/request-validation';
import { shortenUrl } from './routes/urls';
import { ShortenUrlRequestSchema } from './dtos/shorten-url.request';
import { initTracing } from './lib/tracing';

dotenv.config();

initTracing();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());


app.get(`/`, (_, res) => {
    res.send('Hello World! This is the backend for the URL shortening service.');
});

app.post(`/api/v1/urls/shorten`, validateData(ShortenUrlRequestSchema), async (req, res, next) => {
    try {
        await shortenUrl(req, res);
    } catch (error) {
        next(error);
    }
});

app.listen(Number(port), () => {
    console.log(`Server is running on port ${port}`);
});

