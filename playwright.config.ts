import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3005',
    trace: 'on-first-retry',
    viewport: { width: 412, height: 915 }, // Mobile-first viewport
  },
  webServer: {
    command: 'WATCHPACK_POLLING=true npx next dev --webpack -p 3005',
    url: 'http://localhost:3005',
    reuseExistingServer: true,
    timeout: 120 * 1000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Pixel 7'] },
    },
  ],
});
