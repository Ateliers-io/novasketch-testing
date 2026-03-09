# NovaSketch Testing

Dedicated test suite for **integration**, **regression**, and **end-to-end** testing of the NovaSketch collaborative drawing platform.

## Project Structure

```
novasketch-testing/
├── tests/
│   ├── setup.js                          # Global test setup (env, timeout)
│   ├── helpers/
│   │   ├── db.js                         # MongoDB connect/clear/close helpers
│   │   └── auth.js                       # Auth helper utilities
│   ├── integration/                      # Integration test suites
│   │   ├── authCanvasIntegration.test.js  # IT-01: Auth ↔ Canvas workflow
│   │   ├── canvasLifecycle.test.js        # IT-02: Canvas session lifecycle
│   │   ├── sessionLockEnforcement.test.js # IT-03: Session lock enforcement
│   │   ├── shapeDataPersistence.test.js   # IT-04: Shape & Room data persistence
│   │   ├── historyTimeline.test.js        # IT-05: History / Timeline replay
│   │   ├── healthAndErrors.test.js        # IT-06: Health & error handling
│   │   └── participantManagement.test.js  # IT-07: Participant management
│   ├── regression/                       # (Upcoming) Regression test suites
│   └── e2e/                              # (Upcoming) End-to-end test suites
├── reports/                              # Auto-generated HTML test reports
├── jest.integration.config.js            # Jest config for integration tests
├── .env.example                          # Environment variable template
└── package.json
```

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env and set MONGO_URI to your MongoDB connection string
   ```

3. **Ensure backend is available:**
   The tests import the backend app directly (without starting the HTTP server), so the `novasketch-backend` folder must be at the same level as `novasketch-testing`.

## Running Tests

### 1. Integration Tests (Backend / Database)
```bash
npm run test:integration
```

### 2. Frontend E2E / UI Integration tests 
These test strings together the UI's routing logic, context bindings, auth components, and canvas components leveraging **Playwright** as a headless real-browser testing platform.

> **Note**: Your main application MUST be running to execute frontend integration tests!
> In `novasketch-backend/`, run `npm run dev`
> In `novasketch-frontend/`, run `npm run dev`

Then execute the Playwright suite:
```bash
npm run test:frontend
```

### 3. All Tests
```bash
npm test
```

## HTML Reports

Test reports are automatically generated in `./reports/` after each test run:
- **Backend Integration Report:** `reports/integration-test-report.html` (Generated via Jest-HTML-Reporter)
- **Frontend Integration Report:** `reports/frontend-integration-report.html` (Generated via Jest-HTML-Reporter and Playwright Library)

## Test Coverage

| Suite | Epics Covered | Test Count |
|-------|---------------|------------|
| IT-01: Auth ↔ Canvas | Epic 1, 6 | 5 tests |
| IT-02: Canvas Lifecycle | Epic 1 | 8 tests |
| IT-03: Session Lock | Epic 1 (1.5), Epic 3 (3.7) | 6 tests |
| IT-04: Shape Persistence | Epic 2, 6 | 7 tests |
| IT-05: History Timeline | Epic 8 (8.1) | 6 tests |
| IT-06: Health & Errors | Cross-cutting | 8 tests |
| IT-07: Participants | Epic 1 (1.3, 1.4, 1.5) | 6 tests |
| **Frontend Integration** | Epic 1, 2, 8 UI hooks | 4 tests |
| **Total** | | **~50 tests** |