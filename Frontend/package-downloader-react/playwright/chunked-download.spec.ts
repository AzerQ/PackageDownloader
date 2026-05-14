import { expect, test } from "@playwright/test";

test.describe("chunked download settings flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      type SavedDownloadPayload = {
        text: string;
        size: number;
        closed: boolean;
      };

      const globalWindow = window as Window & {
        __savedDownload?: SavedDownloadPayload;
      };

      globalWindow.showSaveFilePicker = async () => ({
        createWritable: async () => ({
          write: async (blob: Blob) => {
            globalWindow.__savedDownload = {
              text: await blob.text(),
              size: blob.size,
              closed: false,
            };
          },
          close: async () => {
            if (globalWindow.__savedDownload) {
              globalWindow.__savedDownload.closed = true;
            }
          },
        }),
      });
    });

    await page.route("**/api/Heartbeat/HeartbeatExists", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ isAlive: true }),
      });
    });
  });

  test("downloads with persisted settings and retries failed chunks", async ({ page }) => {
    const chunkAttempts = new Map<string, number>();

    await page.route("**/api/Packages/GetPackagesChunksInfo**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          fileName: "packages.zip",
          totalSizeInBytes: 6,
          chunkSizeInBytes: 2,
          totalChunks: 3,
          mimeType: "application/zip",
        }),
      });
    });

    await page.route("**/api/Packages/GetPackagesFileChunk**", async (route) => {
      const url = new URL(route.request().url());
      const chunkIndex = url.searchParams.get("chunkIndex") ?? "0";
      const key = `chunk-${chunkIndex}`;
      const attempts = (chunkAttempts.get(key) ?? 0) + 1;
      chunkAttempts.set(key, attempts);

      if (chunkIndex === "1" && attempts < 3) {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "temporary failure" }),
        });
        return;
      }

      const chunkBodies = ["AA", "BB", "CC"];
      await route.fulfill({
        status: 200,
        contentType: "application/octet-stream",
        body: chunkBodies[Number(chunkIndex)],
      });
    });

    await page.goto("/__playwright__/chunked-download");

    await page.getByTestId("chunked-download-open-settings").click();
    await expect(page.getByText("Настройки скачивания чанками")).toBeVisible();

    await page.screenshot({ path: "playwright-artifacts/chunked-download-settings.png", fullPage: true });

    await page.getByLabel("Автоматически определить размер чанка на бэкенде").click();
    await page.getByLabel("Одновременных скачиваний").fill("2");
    await page.getByLabel("Попыток скачивания").fill("3");
    await page.getByTestId("chunked-download-start").click();

    await expect(page.getByRole("button", { name: "Загружено!" })).toBeVisible();
    await expect(page.getByTestId("chunked-download-settings-summary")).toContainText("Параллельно: 2");

    await page.screenshot({ path: "playwright-artifacts/chunked-download-success.png", fullPage: true });

    const savedDownload = await page.evaluate(() => {
      const globalWindow = window as Window & {
        __savedDownload?: { text: string; size: number; closed: boolean };
      };

      return globalWindow.__savedDownload ?? null;
    });

    expect(savedDownload).toEqual({
      text: "AABBCC",
      size: 6,
      closed: true,
    });

    expect(chunkAttempts.get("chunk-1")).toBe(3);

    const storedSettings = await page.evaluate(() =>
      window.localStorage.getItem("package_downloader_chunked_download_settings")
    );

    expect(storedSettings).toContain("\"useAutomaticChunkSize\":true");
    expect(storedSettings).toContain("\"parallelDownloads\":2");
    expect(storedSettings).toContain("\"retryAttempts\":3");
  });

  test("cancels download before completion", async ({ page }) => {
    await page.route("**/api/Packages/GetPackagesChunksInfo**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          fileName: "packages.zip",
          totalSizeInBytes: 6,
          chunkSizeInBytes: 2,
          totalChunks: 3,
          mimeType: "application/zip",
        }),
      });
    });

    await page.route("**/api/Packages/GetPackagesFileChunk**", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.fulfill({
        status: 200,
        contentType: "application/octet-stream",
        body: "AA",
      });
    });

    await page.goto("/__playwright__/chunked-download");
    await page.getByTestId("chunked-download-open-settings").click();
    await page.getByLabel("Одновременных скачиваний").fill("1");
    await page.getByTestId("chunked-download-start").click();

    await expect(page.getByTestId("chunked-download-cancel")).toBeVisible();
    await page.getByTestId("chunked-download-cancel").click();

    await expect(page.getByTestId("chunked-download-cancel")).not.toBeVisible();
    await expect(page.getByTestId("chunked-download-success")).not.toBeVisible();

    const savedDownload = await page.evaluate(() => {
      const globalWindow = window as Window & {
        __savedDownload?: { text: string; size: number; closed: boolean };
      };

      return globalWindow.__savedDownload ?? null;
    });

    expect(savedDownload).toBeNull();
  });
});
