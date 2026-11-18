import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';
import { env } from './src/utils/env';

const authState = path.resolve('.auth', 'user.json');
mkdirSync(path.dirname(authState), { recursive: true });

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  ...(process.env.CI ? { workers: 2 } : {}),
  timeout: 45_000,
  expect: {
    timeout: 10_000,
  },
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['allure-playwright', { outputFolder: 'allure-results', detail: true }],
  ],
  use: {
    baseURL: env.baseUrl,
    testIdAttribute: env.testIdAttribute,
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'setup',
      testMatch: '**/setup/auth.setup.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'chromium',
      testMatch: '**/*.spec.ts',
      testIgnore: '**/responsive.smoke.spec.ts',
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], storageState: authState },
    },
    {
      name: 'firefox',
      testMatch: '**/*.spec.ts',
      testIgnore: '**/responsive.smoke.spec.ts',
      dependencies: ['setup'],
      use: { ...devices['Desktop Firefox'], storageState: authState },
    },
    {
      name: 'webkit',
      testMatch: '**/*.spec.ts',
      testIgnore: '**/responsive.smoke.spec.ts',
      dependencies: ['setup'],
      use: { ...devices['Desktop Safari'], storageState: authState },
    },
    {
      name: 'mobile',
      testMatch: '**/responsive.smoke.spec.ts',
      dependencies: ['setup'],
      use: { ...devices['Pixel 7'], storageState: authState },
    },
  ],
});
