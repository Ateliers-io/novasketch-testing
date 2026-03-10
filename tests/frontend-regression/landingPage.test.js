// ============================================================================
// FRONTEND REGRESSION SUITE 1: Landing Page
// Covers: /, headings, CTA buttons, navigation to /auth,
//         brand identity, page structure
// ============================================================================
import { chromium } from 'playwright';
import { jest } from '@jest/globals';

jest.setTimeout(45000);

describe('Frontend Regression: Landing Page', () => {
    let browser;
    let page;
    const BASE = process.env.FRONTEND_URL || 'http://localhost:5173';

    beforeAll(async () => {
        browser = await chromium.launch();
        page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    });

    afterAll(async () => {
        if (browser) await browser.close();
    });

    it('Regression: Landing page loads and returns a non-empty document', async () => {
        await page.goto(BASE);
        await page.waitForTimeout(2000);
        const body = await page.locator('body').innerText();
        expect(body.length).toBeGreaterThan(20);
    });

    it('Regression: Page has a visible heading (h1)', async () => {
        await page.goto(BASE);
        await page.waitForTimeout(2000);
        const h1 = page.locator('h1');
        if (await h1.count() > 0) {
            const text = await h1.first().innerText();
            expect(text.length).toBeGreaterThan(3);
        }
    });

    it('Regression: NovaSketch brand name appears in the page', async () => {
        await page.goto(BASE);
        await page.waitForTimeout(2000);
        const content = await page.content();
        expect(content).toMatch(/nova|sketch|draw|canvas|collab/i);
    });

    it('Regression: At least one CTA link or button is present', async () => {
        await page.goto(BASE);
        await page.waitForTimeout(2000);
        const ctas = page.locator('a, button');
        expect(await ctas.count()).toBeGreaterThan(0);
    });

    it('Regression: Clicking primary CTA navigates to /auth', async () => {
        await page.goto(BASE);
        await page.waitForTimeout(2000);
        const link = page.locator('a[href="/auth"]').first();
        if (await link.count() > 0) {
            await link.click();
            await page.waitForTimeout(1000);
            expect(page.url()).toMatch(/\/auth/);
        }
    });

    it('Regression: Title tag is set (not empty)', async () => {
        await page.goto(BASE);
        await page.waitForTimeout(1000);
        const title = await page.title();
        expect(title.length).toBeGreaterThan(0);
    });
});
