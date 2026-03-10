export default {
    testEnvironment: 'node',
    maxWorkers: 1,   // Run suites sequentially — prevents parallel Playwright browser resource starvation
    transform: {},
    moduleFileExtensions: ['js', 'mjs', 'json'],
    testMatch: [
        '**/tests/frontend-regression/**/*.test.js',
    ],
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    reporters: [
        'default',
        ['jest-html-reporter', {
            pageTitle: 'NovaSketch Frontend Regression Test Report',
            outputPath: './reports/frontend-regression-report.html',
            includeFailureMsg: true,
            includeSuiteFailure: true,
            includeConsoleLog: false,
            dateFormat: 'yyyy-mm-dd HH:MM:ss',
            theme: 'darkTheme'
        }]
    ]
};
