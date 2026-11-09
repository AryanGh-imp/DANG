import { defineConfig } from '@playwright/test';
import base from './playwright.config.js';

export default defineConfig({
  ...base,
  outputDir: 'test-results-webkit',
  testMatch: ['design.spec.js', 'locale.spec.js'],
  use: { ...base.use, browserName: 'webkit', launchOptions: {} },
});
