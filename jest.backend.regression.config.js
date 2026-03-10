import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, '..', 'novasketch-backend');

export default {
    testEnvironment: 'node',
    maxWorkers: '50%',
    transform: {},
    moduleFileExtensions: ['js', 'mjs', 'json'],
    testMatch: [
        '**/tests/backend-regression/**/*.test.js',
    ],
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    modulePaths: [
        path.join(backendRoot, 'node_modules'),
    ],
    reporters: [
        'default',
        ['jest-html-reporter', {
            pageTitle: 'NovaSketch Backend Regression Test Report',
            outputPath: './reports/backend-regression-report.html',
            includeFailureMsg: true,
            includeSuiteFailure: true,
            includeConsoleLog: false,
            dateFormat: 'yyyy-mm-dd HH:MM:ss',
            theme: 'darkTheme'
        }]
    ]
};
