import {
  CHUNKED_DOWNLOAD_SETTINGS_STORAGE_KEY,
  DEFAULT_CHUNKED_DOWNLOAD_SETTINGS,
  loadChunkedDownloadSettings,
  saveChunkedDownloadSettings,
  sanitizeChunkedDownloadSettings,
} from "./chunkedDownloadSettings";

describe("chunkedDownloadSettings", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("returns defaults when storage is empty", () => {
    expect(loadChunkedDownloadSettings()).toEqual(DEFAULT_CHUNKED_DOWNLOAD_SETTINGS);
  });

  it("sanitizes invalid values", () => {
    expect(
      sanitizeChunkedDownloadSettings({
        chunkSizeInBytes: -1,
        parallelDownloads: 0,
        retryAttempts: NaN,
        useAutomaticChunkSize: true,
        saveMethod: "unknown" as never,
      })
    ).toEqual({
      ...DEFAULT_CHUNKED_DOWNLOAD_SETTINGS,
      useAutomaticChunkSize: true,
    });
  });

  it("persists sanitized settings in localStorage", () => {
    saveChunkedDownloadSettings({
      useAutomaticChunkSize: true,
      chunkSizeInBytes: 123456,
      parallelDownloads: 5,
      retryAttempts: 4,
      saveMethod: "browser",
    });

    expect(window.localStorage.getItem(CHUNKED_DOWNLOAD_SETTINGS_STORAGE_KEY)).toBeTruthy();
    expect(loadChunkedDownloadSettings()).toEqual({
      useAutomaticChunkSize: true,
      chunkSizeInBytes: 123456,
      parallelDownloads: 5,
      retryAttempts: 4,
      saveMethod: "browser",
    });
  });
});
