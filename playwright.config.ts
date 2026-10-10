import { defineConfig, devices } from '@playwright/test'

/**
 * UI regression. Runs against a deployed or local app; it never starts a server.
 * PLANTX_E2E_URL: the app (default local QA web). PLANTX_PP_PASSWORD (+ PLANTX_PP_ADMIN_*): PP email + password logins (QA uses the session route).
 * VERCEL_AUTOMATION_BYPASS_SECRET: passes Vercel deployment protection on previews.
 */
const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET?.trim()

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
  outputDir: './test-results',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  use: {
    baseURL: process.env.PLANTX_E2E_URL || 'http://localhost:5173',
    locale: 'en-US',
    screenshot: 'on',
    video: 'on',
    trace: 'retain-on-failure',
    // Plant photos come only from the live camera: Chromium's fake camera (a test pattern), access granted.
    permissions: ['camera'],
    launchOptions: { args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] },
    extraHTTPHeaders: bypass
      ? { 'x-vercel-protection-bypass': bypass, 'x-vercel-set-bypass-cookie': 'true' }
      : undefined,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 860 } } },
    { name: 'phone', use: { ...devices['Pixel 7'] } },
  ],
})
