/**
 * Jest Configuration for NovaSketch Integration Tests
 * 
 * Configured for ES Modules support.
 * Generates an HTML report via jest-html-reporter.
 */
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, '..', 'novasketch-backend');

export default {
    testEnvironment: 'node',

    // Each test file gets its own isolated MongoDB database
    maxWorkers: '50%',

    // ES Modules — no transform needed with --experimental-vm-modules
    transform: {},

    moduleFileExtensions: ['js', 'mjs', 'json'],

    testMatch: [
        '**/tests/backend-integration/**/*.test.js',
    ],

    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

    // Allow resolving backend dependencies (installed via pnpm in the sibling dir)
    modulePaths: [
        path.join(backendRoot, 'node_modules'),
    ],

    collectCoverageFrom: [
        '!**/node_modules/**'
    ],

    testPathIgnorePatterns: ['/node_modules/'],

    verbose: true,
    clearMocks: true,
    restoreMocks: true,

    // HTML Reporter for visual test reports
    reporters: [
        'default',
        ['jest-html-reporter', {
            pageTitle: 'NovaSketch Integration Test Report',
            outputPath: './reports/integration-test-report.html',
            includeFailureMsg: true,
            includeSuiteFailure: true,
            includeConsoleLog: false,
            dateFormat: 'yyyy-mm-dd HH:MM:ss',
            theme: 'darkTheme'
        }]
    ]
};
