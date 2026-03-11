import fs from 'fs';
import path from 'path';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { fileURLToPath } from 'url';

process.on('unhandledRejection', () => {});
process.on('uncaughtException', () => {});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FRONTEND_URLS = [
    { url: 'http://localhost:4173/', name: 'landing-page' },
    { url: 'http://localhost:4173/auth', name: 'auth-page' }
];

const REPORTS_DIR = path.resolve(__dirname, '../../reports');

async function runLighthouse(url, name) {
    const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless', '--no-sandbox', '--ignore-certificate-errors'] });
    const options = {
        logLevel: 'info',
        output: 'html',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        port: chrome.port
    };

    console.log(`\n⏳ Running Lighthouse on Frontend [${name}]: ${url}`);
    
    try {
        const runnerResult = await lighthouse(url, options);

        // Make sure reports directory exists
        if (!fs.existsSync(REPORTS_DIR)) {
            fs.mkdirSync(REPORTS_DIR, { recursive: true });
        }

        const reportHtml = runnerResult.report;
        const reportPath = name === 'landing-page'
            ? path.join(REPORTS_DIR, `frontend-performance.html`) // Overwrite old broken file
            : path.join(REPORTS_DIR, `frontend-performance-${name}.html`);
        fs.writeFileSync(reportPath, reportHtml);

        console.log(`✅ Report generated: ${reportPath}`);
        console.log(
            `Performance: ${runnerResult.lhr.categories.performance.score * 100} | ` +
            `Accessibility: ${runnerResult.lhr.categories.accessibility.score * 100} | ` +
            `Best Practices: ${runnerResult.lhr.categories['best-practices'].score * 100} | ` +
            `SEO: ${runnerResult.lhr.categories.seo.score * 100}`
        );

    } catch (err) {
        console.error(`❌ Failed to run Lighthouse on ${url}:`, err.message);
    } finally {
        try {
            await chrome.kill();
        } catch (killErr) {
            // ignore
        }
    }
}

async function runAll() {
    console.log("🚀 Starting Frontend Performance Testing...");
    for (const target of FRONTEND_URLS) {
        await runLighthouse(target.url, target.name);
    }
    console.log("\n🎉 Frontend Performance Testing Complete!");
    process.exit(0);
}

runAll();
