import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';
const chrome = process.platform === 'win32' && 'C:/Program Files/Google/Chrome/Application/chrome.exe';
export default defineConfig({
  testDir: './tests/browser', timeout: 30000, workers: 1,
  use: { baseURL: 'http://127.0.0.1:4173', locale: 'fa-IR', viewport: { width: 390, height: 844 },
    launchOptions: chrome && existsSync(chrome) ? { executablePath: chrome } : {} },
  webServer: { command: 'npm run serve', url: 'http://127.0.0.1:4173/Dang/', reuseExistingServer: !process.env.CI },
});
