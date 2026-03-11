import fs from 'fs';
import path from 'path';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { fileURLToPath } from 'url';

process.on('unhandledRejection', () => {});
process.on('uncaughtException', () => {});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Even though Lighthouse is primarily for frontend elements, 
// running it against backend endpoints evaluates server response time (TTFB), text compression, etc.
const BACKEND_URLS = [
    { url: 'http://localhost:5000/', name: 'backend-performance' }
];

const REPORTS_DIR = path.resolve(__dirname, '../../reports');

async function runLighthouse(url, name) {
    const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless', '--no-sandbox', '--ignore-certificate-errors'] });
    const options = {
        logLevel: 'info',
        output: 'html',
        onlyCategories: ['performance'], // Since it's a backend, we only care about performance (TTFB, server response)
        port: chrome.port
    };

    console.log(`\n⏳ Running Lighthouse on Backend [${name}]: ${url}`);
    
    try {
        const runnerResult = await lighthouse(url, options);

        if (!fs.existsSync(REPORTS_DIR)) {
            fs.mkdirSync(REPORTS_DIR, { recursive: true });
        }

        const reportHtml = runnerResult.report;
        const reportPath = path.join(REPORTS_DIR, `${name}.html`);
        fs.writeFileSync(reportPath, reportHtml);

        console.log(`✅ Report generated: ${reportPath}`);
        console.log(`Performance Score: ${Math.round(runnerResult.lhr.categories.performance.score * 100)}/100`);
        
        // Output TTFB Specifically for Backend
        const ttfb = runnerResult.lhr.audits['server-response-time']?.displayValue || 'N/A';
        console.log(`Time to First Byte (TTFB): ${ttfb}`);

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
    console.log("🚀 Starting Backend Performance Testing with Lighthouse...");
    for (const target of BACKEND_URLS) {
        await runLighthouse(target.url, target.name);
    }
    console.log("\n🎉 Backend Performance Testing Complete!");
    process.exit(0);
}

runAll();
