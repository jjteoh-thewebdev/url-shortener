import { test, expect } from '@playwright/test';
import { ulid } from 'ulid';
test.describe('URL Shortener', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the home page before each test
        await page.goto('http://localhost:3000');
    });

    test('should shorten a URL without password(base case)', async ({ page }) => {
        // Fill in the long URL
        await page.getByLabel('URL to Shorten').fill('https://example.com/test');

        // Submit the form
        await page.getByRole('button', { name: 'Create Short URL' }).click();

        // Wait for the response
        await expect(page.getByText('Your short URL')).toBeVisible();

        const redirectUrl = (process.env.NEXT_PUBLIC_REDIRECT_URL ?? ``).replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
        const shortUrlRegex = new RegExp(`^${redirectUrl}/[0-9a-zA-Z]{7}$`)

        // Verify the shortened URL is displayed
        const shortUrl = await page.locator('#shortened-url');
        expect(shortUrl).toBeVisible();
        expect(shortUrl).toHaveValue(shortUrlRegex);
    });

    test('should shorten a URL with password', async ({ page }) => {
        // Fill in the long URL
        await page.getByLabel('URL to Shorten').fill('https://example.com/test');

        // Check password protection
        await page.getByTestId('password-switch').click();

        // wait the password input to be visible
        await expect(page.getByTestId('password-input')).toBeVisible();

        // Fill in password
        await page.getByTestId('password-input').fill('test123');

        // Submit the form
        await page.getByRole('button', { name: 'Create Short URL' }).click();

        // Wait for the response
        await expect(page.getByText('Your short URL')).toBeVisible();

        const redirectUrl = (process.env.NEXT_PUBLIC_REDIRECT_URL ?? ``).replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
        const shortUrlRegex = new RegExp(`^${redirectUrl}/[0-9a-zA-Z]{7}$`)

        // Verify the shortened URL is displayed
        const shortUrl = await page.locator('#shortened-url');
        expect(shortUrl).toBeVisible();
        expect(shortUrl).toHaveValue(shortUrlRegex);
    });

    test('should shorten a URL with custom alias', async ({ page }) => {
        // Fill in the long URL
        await page.getByLabel('URL to Shorten').fill('https://example.com/test');

        // Fill in custom alias
        const customAlias = ulid();
        await page.getByTestId('custom-short-url').fill(customAlias);

        // Submit the form
        await page.getByRole('button', { name: 'Create Short URL' }).click();

        // Wait for the response
        await expect(page.getByText('Your short URL')).toBeVisible();

        const redirectUrl = (process.env.NEXT_PUBLIC_REDIRECT_URL ?? ``)

        // Verify the shortened URL is displayed
        const shortUrl = await page.locator('#shortened-url');
        expect(shortUrl).toBeVisible();
        expect(shortUrl).toHaveValue(redirectUrl + '/' + customAlias);
    });

    test('should handle invalid URL format', async ({ page }) => {
        // Fill in invalid URL
        await page.getByLabel('URL to Shorten').fill('not-a-url');

        // Submit the form
        await page.getByRole('button', { name: 'Create Short URL' }).click();

        // Verify error message
        await expect(page.getByText('Please enter a valid URL')).toBeVisible();
    });

    test('should handle password protected URL redirection', async ({ page, context }) => {
        // Create a password protected URL
        await page.getByLabel('URL to Shorten').fill('https://example.com/secure');
        await page.getByTestId('password-switch').click();
        await expect(page.getByTestId('password-input')).toBeVisible();
        await page.getByTestId('password-input').fill('test123');
        await page.getByRole('button', { name: 'Create Short URL' }).click();

        // Wait for the response, and verify shortened url is displayed
        await expect(page.getByText('Your short URL')).toBeVisible();
        const redirectUrl = (process.env.NEXT_PUBLIC_REDIRECT_URL ?? ``).replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
        const shortUrlRegex = new RegExp(`^${redirectUrl}/[0-9a-zA-Z]{7}$`)
        const shortUrl = await page.locator('#shortened-url');
        expect(shortUrl).toBeVisible();
        expect(shortUrl).toHaveValue(shortUrlRegex);

        // click the open link button and wait for the new tab to open
        const [newPage] = await Promise.all([
            context.waitForEvent('page'),          // Wait for the new tab
            page.getByTestId('open-link-button').click()      // Click that triggers it
        ]);

        // wait for the new page to load
        await newPage.waitForLoadState();

        // Enter password
        await newPage.getByTestId('password-input').fill('test123');
        await newPage.getByTestId(`password-submit-button`).click();

        await newPage.waitForLoadState();

        // Verify redirection
        await expect(newPage).toHaveURL('https://example.com/secure');
    });

    // TODO: uncomment this test after the expired-url is created
    // test('should handle expired URL', async ({ page }) => {
    //     const redirectUrl = (process.env.NEXT_PUBLIC_REDIRECT_URL ?? ``).replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')

    //     // Visit an expired URL (using expired-url created from our e2e setup)
    //     await page.goto(`${redirectUrl}/expired-url`);

    //     // Verify error message
    //     await expect(page.getByText('url expired')).toBeVisible();
    // });
}); 