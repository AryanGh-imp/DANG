import { test as base, expect } from '@playwright/test';

export async function isolateAnalytics(context) {
  // Functional CI must not create visits in the maintainer's real dashboard.
  // Dedicated analytics tests exercise the official script with a local collector.
  await context.route('https://static.cloudflareinsights.com/beacon.min.js', route =>
    route.fulfill({ contentType: 'application/javascript', body: '// Analytics isolated in functional tests.' }));
}
export const test = base.extend({
  analyticsIsolation: [async ({ context }, use) => { await isolateAnalytics(context); await use(); }, { auto: true }],
});
export { expect };
