import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./playwright",
  timeout: 60_000,
  use: {
    baseURL: "http://127.0.0.1:5094",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 5094",
    url: "http://127.0.0.1:5094",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
