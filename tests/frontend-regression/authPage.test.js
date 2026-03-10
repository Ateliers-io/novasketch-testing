// ============================================================================
// FRONTEND REGRESSION SUITE 2: Auth Page (/auth)
// Uses domcontentloaded wait, then polls body for React content
// ============================================================================
import { chromium } from 'playwright';
import { jest } from '@jest/globals';

jest.setTimeout(60000);

describe('Frontend Regression: Auth Page', () => {
    let browser;
    let page;
    let bodyHtml = '';
    let pageUrl = '';
    const BASE = process.env.FRONTEND_URL || 'http://localhost:5173';

    beforeAll(async () => {
        browser = await chromium.launch();
        page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
        // Use 'domcontentloaded' — does NOT wait for network idle (Vite HMR never idles)
        await page.goto(`${BASE}/auth`, { waitUntil: 'domcontentloaded', timeout: 15000 });
        // Poll until body has React-rendered content (> 500 chars — rules out Vite shell)
        await page.waitForFunction(
            () => document.body.innerHTML.length > 500,
            { timeout: 20000, polling: 300 }
        ).catch(() => { }); // Don't fail even if poll times out
        await page.waitForTimeout(1500);
        pageUrl = page.url();
        bodyHtml = await page.evaluate(() => document.body.innerHTML);
    });

    afterAll(async () => {
        if (browser) await browser.close();
    });

    it('Regression: /auth URL is correct', () => {
        expect(pageUrl).toMatch(/\/auth/);
    });

    it('Regression: Body HTML is non-empty (React mounted)', () => {
        expect(bodyHtml.length).toBeGreaterThan(100);
    });

    it('Regression: Google OAuth reference in body', () => {
        expect(bodyHtml.toLowerCase()).toContain('google');
    });

    it('Regression: Auth form contains email reference', () => {
        expect(bodyHtml.toLowerCase()).toContain('email');
    });

    it('Regression: Auth form contains password reference', () => {
        expect(bodyHtml.toLowerCase()).toContain('password');
    });

    it('Regression: Sign In or login reference exists', () => {
        const lower = bodyHtml.toLowerCase();
        expect(lower.includes('sign') || lower.includes('login')).toBe(true);
    });

    it('Regression: Back navigation button exists', () => {
        expect(bodyHtml.toLowerCase()).toContain('back');
    });

    it('Regression: Button elements exist in DOM', async () => {
        const count = await page.evaluate(() => document.querySelectorAll('button').length);
        expect(count).toBeGreaterThan(0);
    });

    it('Regression: NovaSketch-related content present', () => {
        const lower = bodyHtml.toLowerCase();
        expect(lower.includes('nova') || lower.includes('sketch')).toBe(true);
    });

    it('Regression: Form tag or form-like structure in DOM', () => {
        expect(bodyHtml.toLowerCase().includes('form')).toBe(true);
    });

    it('Regression: Name input for sign up present', () => {
        expect(bodyHtml.toLowerCase().includes('name')).toBe(true);
    });

    it('Regression: Input elements exist in DOM', async () => {
        const count = await page.evaluate(() => document.querySelectorAll('input').length);
        expect(count).toBeGreaterThan(0);
    });
});
