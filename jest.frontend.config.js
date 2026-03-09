export default {
    testEnvironment: 'node',
    transform: {},
    moduleFileExtensions: ['js', 'mjs', 'json'],
    testMatch: [
        '**/tests/frontend-integration/**/*.test.js',
    ],
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    reporters: [
        'default',
        ['jest-html-reporter', {
            pageTitle: 'NovaSketch Frontend Integration Test Report',
            outputPath: './reports/frontend-integration-report.html',
            includeFailureMsg: true,
            includeSuiteFailure: true,
            includeConsoleLog: false,
            dateFormat: 'yyyy-mm-dd HH:MM:ss',
            theme: 'darkTheme'
        }]
    ]
};
