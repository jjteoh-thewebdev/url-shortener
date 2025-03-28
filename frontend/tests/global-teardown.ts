import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
    // Clean up any resources created during tests
    console.log('Starting global teardown...');
}

export default globalTeardown; 