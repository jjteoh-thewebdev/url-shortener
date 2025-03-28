import { FullConfig } from '@playwright/test';
import dotenv from 'dotenv';


async function globalSetup(config: FullConfig) {
    // Ensure all required services are running
    // You might want to start your backend services here if they're not already running
    console.log('Starting global setup...');

    // load environment variables
    dotenv.config();
}

export default globalSetup;