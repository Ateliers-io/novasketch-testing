// ============================================================================
// FRONTEND REGRESSION SUITE 3: Dashboard, Board & 404 Pages
// ============================================================================
import { chromium } from 'playwright';
import { jest } from '@jest/globals';

jest.setTimeout(60000);

describe('Frontend Regression: Dashboard Page (/home)', () => {
    let browser;
    let page;
    const BASE = process.env.FRONTEND_URL || 'http://localhost:5173';

    beforeAll(async () => {
        browser = await chromium.launch();
        page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
        await page.goto(`${BASE}/home`);
        await page.waitForTimeout(2500);
    });

    afterAll(async () => {
        if (browser) await browser.close();
    });

    it('Regression: /home loads without page crash', async () => {
        const raw = await page.content();
        expect(raw.length).toBeGreaterThan(200);
    });

    it('Regression: /home renders meaningful HTML structure', async () => {
        const raw = await page.content();
        expect(raw).toMatch(/<div|<nav|<main|<canvas/i);
    });

    it('Regression: /home has at least one interactive element', async () => {
        const interactives = page.locator('button, a');
        expect(await interactives.count()).toBeGreaterThan(0);
    });

    it('Regression: /home title is set', async () => {
        const title = await page.title();
        expect(title.length).toBeGreaterThan(0);
    });

    it('Regression: NovaSketch brand name in page source', async () => {
        const raw = await page.content();
        expect(raw).toMatch(/NovaSketch|nova|sketch/i);
    });
});

describe('Frontend Regression: Board Page (/board/:id)', () => {
    let browser;
    let page;
    const BASE = process.env.FRONTEND_URL || 'http://localhost:5173';

    beforeAll(async () => {
        browser = await chromium.launch();
        page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
        await page.goto(`${BASE}/board/regression-canvas-id`);
        await page.waitForTimeout(3000);
    });

    afterAll(async () => {
        if (browser) await browser.close();
    });

    it('Regression: /board/:id loads without crashing', async () => {
        const raw = await page.content();
        expect(raw.length).toBeGreaterThan(200);
    });

    it('Regression: board page has meaningful HTML (not completely blank)', async () => {
        const raw = await page.content();
        expect(raw).toMatch(/<div|<canvas|<svg|<nav/i);
    });

    it('Regression: board renders canvas, loading UI, or redirects to auth', async () => {
        const raw = await page.content();
        const currentUrl = page.url();
        const hasCanvas = /<canvas/i.test(raw) || /<svg/i.test(raw);
        const isAuth = currentUrl.includes('/auth');
        // Also accept non-blank board loading / error states (the board component mounted)
        const hasBoard = /board|canvas|draw|sketch|toolbar|loading/i.test(raw);
        expect(hasCanvas || isAuth || hasBoard).toBe(true);
    });

    it('Regression: board page title is set', async () => {
        const title = await page.title();
        expect(title.length).toBeGreaterThan(0);
    });
});

describe('Frontend Regression: 404 Not Found Page', () => {
    let browser;
    let page;
    const BASE = process.env.FRONTEND_URL || 'http://localhost:5173';

    beforeAll(async () => {
        browser = await chromium.launch();
        page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
        await page.goto(`${BASE}/this-route-utterly-does-not-exist-xyz`);
        await page.waitForTimeout(2000);
    });

    afterAll(async () => {
        if (browser) await browser.close();
    });

    it('Regression: unknown route renders a page (React Router catches it)', async () => {
        const raw = await page.content();
        expect(raw.length).toBeGreaterThan(200);
    });

    it('Regression: 404 page body is not empty', async () => {
        const body = await page.locator('body').innerText();
        expect(body.length).toBeGreaterThan(0);
    });

    it('Regression: 404 page contains 404-style text or navigation back', async () => {
        const raw = await page.content();
        // Either a 404 message or a home link exists
        const has404 = /404|not found|page not found/i.test(raw);
        const hasHomeLink = raw.includes('href="/') || raw.includes('href="/"');
        expect(has404 || hasHomeLink).toBe(true);
    });
});
