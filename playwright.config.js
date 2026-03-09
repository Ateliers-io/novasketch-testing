import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    testDir: './tests/frontend-integration',
    /* Maximum time one test can run for. */
    timeout: 30 * 1000,
    expect: {
        timeout: 5000,
    },
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,
    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? 1 : undefined,
    /* Reporter to use. */
    reporter: [
        ['html', { outputFolder: './reports/frontend-integration-report' }]
    ],

    /* Shared settings for all the projects below. */
    use: {
        /* Base URL to use in actions like `await page.goto('/')`. */
        baseURL: process.env.FRONTEND_URL || 'http://localhost:5173',

        /* Collect trace when retrying the failed test. */
        trace: 'on-first-retry',

        // Auto-capture screenshot on failure
        screenshot: 'only-on-failure',
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        // We can add Firefox/Webkit here if desired.
    ],
});
