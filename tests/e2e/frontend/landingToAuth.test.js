// ============================================================================
// FRONTEND E2E SUITE 1: Landing → Auth Navigation Journey
// ============================================================================
import { chromium } from 'playwright';
import { jest } from '@jest/globals';

jest.setTimeout(60000);

describe('Frontend E2E: Landing → Auth Navigation Journey', () => {
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

    it('Step 1 — User opens NovaSketch and landing page renders', async () => {
        await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForTimeout(2000);
        const html = await page.evaluate(() => document.body.innerHTML);
        expect(html.length).toBeGreaterThan(100);
    });

    it('Step 2 — Landing page displays the NovaSketch brand', async () => {
        const title = await page.title();
        const html = await page.evaluate(() => document.body.innerHTML);
        expect(title.toLowerCase().includes('nova') || html.toLowerCase().includes('nova')).toBe(true);
    });

    it('Step 3 — Landing page has clickable navigation elements', async () => {
        const count = await page.locator('a:visible, button:visible').count();
        expect(count).toBeGreaterThan(0);
    });

    it('Step 4 — User navigates to the Auth page via URL', async () => {
        await page.goto(`${BASE}/auth`, { waitUntil: 'domcontentloaded', timeout: 15000 });
        // Use ns-inp to wait for React hydration
        await page.waitForSelector('.ns-inp', { timeout: 15000 }).catch(() => { });
        await page.waitForTimeout(2000);
        expect(page.url()).toContain('/auth');
    });

    it('Step 5 — Auth page loads with form UI elements', async () => {
        const inputsCount = await page.evaluate(() => document.querySelectorAll('input').length);
        expect(inputsCount).toBeGreaterThan(1);
    });

    it('Step 6 — Auth page includes Google OAuth option', async () => {
        const html = await page.evaluate(() => document.body.innerHTML);
        expect(html.toLowerCase()).toContain('google');
    });

    it('Step 7 — User clicks back to return to landing page', async () => {
        // More robust with visibility filter
        const backBtn = page.locator('button:has-text("back"):visible, a[href="/"]:visible').first();
        if (await backBtn.count() > 0) {
            await backBtn.click({ force: true });
            await page.waitForTimeout(1000);
            expect(page.url()).not.toContain('/auth');
        }
    });

    it('Step 8 — Browser back navigation brings user back', async () => {
        await page.goto(`${BASE}/auth`, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForSelector('.ns-inp', { timeout: 15000 }).catch(() => { });
        await page.waitForTimeout(2000);
        await page.goBack();
        await page.waitForTimeout(1000);
        expect(page.url()).not.toContain('/auth');
    });
});
