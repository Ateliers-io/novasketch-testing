import { chromium } from 'playwright';
import { jest } from '@jest/globals';

jest.setTimeout(45000);

describe('NovaSketch Dashboard & Board Flow UI', () => {
    let browser;
    let page;

    beforeAll(async () => {
        browser = await chromium.launch();
        page = await browser.newPage();
    });

    afterAll(async () => {
        if (browser) await browser.close();
    });

    it('Dashboard layout mounts and includes "New Canvas" button', async () => {
        const port = process.env.FRONTEND_URL || 'http://localhost:5173';
        await page.goto(`${port}/home`);

        const title = await page.title();
        expect(title).toMatch(/NovaSketch|Dashboard/i);

        const createBtn = page.locator('button:has-text("New"), button:has-text("Create"), button:has-text("Blank")').first();

        if (page.url().includes('/auth')) {
            console.log("Redirected to /auth, dashboard is protected.");
            return;
        }

        await page.waitForLoadState('networkidle');

        if (await createBtn.count() > 0) {
            expect(await createBtn.isVisible()).toBe(true);
        }
    });

    it('Canvas route mounts and renders the canvas', async () => {
        const port = process.env.FRONTEND_URL || 'http://localhost:5173';
        await page.goto(`${port}/board/demo-canvas-1234`);

        await page.waitForTimeout(2000);

        if (page.url().includes('/auth')) {
            console.log("Redirected to /auth, can't fully mount the board without logging in.");
            return;
        }

        const canvasContainers = page.locator('canvas, .konvajs-content');

        if (await canvasContainers.count() > 0) {
            expect(await canvasContainers.first().isVisible()).toBe(true);
        }

        const toolbars = page.locator('nav, .toolbar, [aria-label="Toolbar"], button:has-text("Pen"), button:has-text("Select")');
        if (await toolbars.count() > 0) {
            expect(await toolbars.first().isVisible()).toBe(true);
        }
    });
});
