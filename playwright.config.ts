import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:3005',
    trace: 'on-first-retry',
    viewport: { width: 412, height: 915 }, // Mobile-first viewport
  },
  webServer: {
    command: 'npx next start -H 127.0.0.1 -p 3005',
    url: 'http://127.0.0.1:3005',
    reuseExistingServer: true,
    timeout: 30 * 1000,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Pixel 7'],
        storageState: {
          cookies: [
            {
              name: 'digital_menu_session',
              value: 'owner',
              domain: '127.0.0.1',
              path: '/',
              expires: Math.floor(Date.now() / 1000) + 86400,
              httpOnly: false,
              secure: false,
              sameSite: 'Lax',
            },
          ],
          origins: [
            {
              origin: 'http://127.0.0.1:3005',
              localStorage: [
                {
                  name: 'digital_menu_admin_session_v2',
                  value: JSON.stringify({
                    role: 'owner',
                    userId: 'owner-addis-master',
                    name: 'Abebe Bikila',
                    identifier: 'owner@addiscafeteria.com',
                    token: 'playwright-test-token',
                    loggedInAt: 1760000000000,
                  }),
                },
              ],
            },
          ],
        },
      },
    },
  ],
});
