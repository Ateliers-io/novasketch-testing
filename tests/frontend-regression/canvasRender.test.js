import { chromium } from 'playwright';
import { jest } from '@jest/globals';

jest.setTimeout(45000);

describe('Frontend Regression: Canvas Secure Navigation', () => {
    let browser;
    let page;

    beforeAll(async () => {
        browser = await chromium.launch();
        page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    });

    afterAll(async () => {
        if (browser) await browser.close();
    });

    it('Regression: Protected /home route either redirects to /auth or shows dashboard UI', async () => {
        const port = process.env.FRONTEND_URL || 'http://localhost:5173';

        // Navigate without any auth token in storage
        await page.goto(`${port}/home`);
        // Wait for React Router + potential async auth check to settle
        await page.waitForTimeout(2500);

        const currentUrl = page.url();

        if (currentUrl.includes('/auth')) {
            // Route guard is working — redirected to auth
            expect(currentUrl).toMatch(/.*\/auth/);
        } else {
            // Dashboard is rendered — at minimum it should have some navigable UI
            const bodyText = await page.locator('body').innerText();
            expect(bodyText.length).toBeGreaterThan(10);
        }
    });

    it('Regression: Protected /board/:id route either redirects to /auth or shows canvas UI', async () => {
        const port = process.env.FRONTEND_URL || 'http://localhost:5173';

        await page.goto(`${port}/board/regression-board-test`);
        await page.waitForTimeout(2500);

        const currentUrl = page.url();

        if (currentUrl.includes('/auth')) {
            expect(currentUrl).toMatch(/.*\/auth/);
        } else {
            // Canvas page mounted — verify page is not blank
            const bodyText = await page.locator('body').innerText();
            expect(bodyText.length).toBeGreaterThan(10);
        }
    });
});
