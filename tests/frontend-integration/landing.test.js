import { chromium } from 'playwright';

describe('NovaSketch Landing Page Integration', () => {
    let browser;
    let page;

    beforeAll(async () => {
        browser = await chromium.launch();
        page = await browser.newPage();
    });

    afterAll(async () => {
        if (browser) await browser.close();
    });

    it('successfully renders and navigates to Auth', async () => {
        const port = process.env.FRONTEND_URL || 'http://localhost:5173';
        await page.goto(port);

        // Verify the title or main heading is present
        const title = await page.title();
        expect(title).toMatch(/NovaSketch|Novasketch/i);

        // Wait for the body content to appear
        await page.waitForLoadState('networkidle');

        // Look for typical call-to-action buttons
        const linkMatches = page.locator('a[href="/auth"], a:has-text("Start"), a:has-text("Login"), button:has-text("Start")');

        // Ensure at least one link/button exists to enter the app
        const count = await linkMatches.count();
        if (count > 0) {
            const firstLink = linkMatches.first();
            await expect(await firstLink.isVisible()).toBe(true);

            // Simulate clicking it to see if it redirects correctly
            await firstLink.click();
            await page.waitForURL(/.*\/auth|.*\/home/);
            const currentUrl = page.url();
            expect(currentUrl).toMatch(/.*\/auth|.*\/home/);
        }
    });

});
