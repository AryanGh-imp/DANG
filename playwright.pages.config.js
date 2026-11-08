import { defineConfig } from "@playwright/test";
import base from "./playwright.config.js";

export default defineConfig({
  ...base,
  testMatch: "deployment.spec.js",
  outputDir: "test-results-pages",
  projects: [{ name: "pages" }],
  use: { ...base.use, baseURL: "http://127.0.0.1:4174" },
  webServer: {
    command: "npm run serve:pages",
    url: "http://127.0.0.1:4174/DANG/",
    env: { PORT: "4174" },
    reuseExistingServer: false,
  },
});
