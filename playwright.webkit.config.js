import { defineConfig } from '@playwright/test';
import base from './playwright.config.js';

export default defineConfig({
  ...base,
  outputDir: 'test-results-webkit',
  testMatch: ['app.spec.js', 'deployment.spec.js', 'design.spec.js', 'locale.spec.js', 'updates.spec.js', 'startup.spec.js', 'analytics.spec.js', 'upgrade.spec.js'],
  use: { ...base.use, browserName: 'webkit', launchOptions: {} },
});
