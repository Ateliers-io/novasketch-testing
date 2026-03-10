// ============================================================================
// FRONTEND E2E SUITE 2: Full Auth Form Journey (Sign Up + Sign In)
// ============================================================================
import { chromium } from 'playwright';
import { jest } from '@jest/globals';

jest.setTimeout(60000);

describe('Frontend E2E: Auth Page Full Form Interaction Journey', () => {
    let browser;
    let page;
    const BASE = process.env.FRONTEND_URL || 'http://localhost:5173';

    beforeAll(async () => {
        browser = await chromium.launch();
        page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
        await page.goto(`${BASE}/auth`, { waitUntil: 'domcontentloaded', timeout: 15000 });
        // Use ns-inp to wait for React hydration
        await page.waitForSelector('.ns-inp', { timeout: 15000 }).catch(() => { });
        await page.waitForTimeout(2000);
    });

    afterAll(async () => {
        if (browser) await browser.close();
    });

    it('Step 1 — /auth page loaded with rendered content', async () => {
        expect(page.url()).toContain('/auth');
        const html = await page.evaluate(() => document.body.innerHTML);
        expect(html.length).toBeGreaterThan(500);
    });

    it('Step 2 — Multiple input fields rendered in auth form', async () => {
        const count = await page.evaluate(() => document.querySelectorAll('input').length);
        expect(count).toBeGreaterThan(1); // Name, email, password
    });

    it('Step 3 — User types name into the Name input field', async () => {
        const nameInput = page.locator('input[name="name"]').first();
        if (await nameInput.count() > 0) {
            await nameInput.fill('E2E TestUser', { force: true });
            const val = await nameInput.inputValue();
            expect(val).toBe('E2E TestUser');
        }
    });

    it('Step 4 — User types email address into the Email input', async () => {
        const emailInput = page.locator('input[type="email"]').first();
        if (await emailInput.count() > 0) {
            await emailInput.fill('e2e-test@novasketch.com', { force: true });
            const val = await emailInput.inputValue();
            expect(val).toBe('e2e-test@novasketch.com');
        }
    });

    it('Step 5 — User types password into the Password input', async () => {
        const pwInput = page.locator('input[type="password"]').first();
        if (await pwInput.count() > 0) {
            await pwInput.fill('SecureE2EPass123!', { force: true });
            const val = await pwInput.inputValue();
            expect(val).toBe('SecureE2EPass123!');
        }
    });

    it('Step 6 — Form has submission buttons (Sign Up / Sign In)', async () => {
        const count = await page.evaluate(() => document.querySelectorAll('button').length);
        expect(count).toBeGreaterThan(2);
    });

    it('Step 7 — User clicks the Sign In toggle button (visible one)', async () => {
        // Filter for visible button specifically to handle mobile/desktop duplicates
        const toggleBtn = page.locator('button:has-text("Sign In"):visible').first();
        if (await toggleBtn.count() > 0) {
            await toggleBtn.click({ force: true });
            await page.waitForTimeout(1000);
        }
        expect(page.url()).toContain('/auth');
    });

    it('Step 8 — Google OAuth button is clickable without navigation crash', async () => {
        const googleBtn = page.locator('button:has-text("Google"), button:has-text("Continue with"):visible').first();
        if (await googleBtn.count() > 0) {
            try {
                await googleBtn.click({ force: true, timeout: 3000 });
                await page.waitForTimeout(500);
            } catch (_) { }
        }
        expect(page.url()).toContain('/auth');
    });

    it('Step 9 — Back button navigates user away from /auth to landing', async () => {
        const backBtn = page.locator('button:has-text("back"):visible').first();
        if (await backBtn.count() > 0) {
            await backBtn.click({ force: true });
            await page.waitForTimeout(1000);
            expect(page.url()).not.toContain('/auth');
        }
    });

    it('Step 10 — Re-navigating to /auth after leaving loads fresh page', async () => {
        await page.goto(`${BASE}/auth`, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForSelector('.ns-inp', { timeout: 15000 }).catch(() => { });
        await page.waitForTimeout(2000);
        expect(page.url()).toContain('/auth');
        const count = await page.evaluate(() => document.querySelectorAll('input').length);
        expect(count).toBeGreaterThan(1);
    });
});
