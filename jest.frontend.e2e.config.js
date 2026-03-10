export default {
    testEnvironment: 'node',
    maxWorkers: 1,  // Run sequentially — each suite launches its own browser instance
    transform: {},
    moduleFileExtensions: ['js', 'mjs', 'json'],
    testMatch: [
        '**/tests/e2e/frontend/**/*.test.js',
    ],
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    reporters: [
        'default',
        ['jest-html-reporter', {
            pageTitle: 'NovaSketch Frontend E2E Test Report',
            outputPath: './reports/frontend-e2e-report.html',
            includeFailureMsg: true,
            includeSuiteFailure: true,
            includeConsoleLog: false,
            dateFormat: 'yyyy-mm-dd HH:MM:ss',
            theme: 'darkTheme'
        }]
    ]
};
