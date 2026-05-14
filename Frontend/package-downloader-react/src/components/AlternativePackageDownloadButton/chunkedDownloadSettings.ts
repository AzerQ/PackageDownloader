import { DEFAULT_CHUNK_SIZE } from "../../services/apiClient";

export const CHUNKED_DOWNLOAD_SETTINGS_STORAGE_KEY = "package_downloader_chunked_download_settings";
export const AUTO_CHUNK_SIZE_SENTINEL = 0;

export interface ChunkedDownloadSettings {
  useAutomaticChunkSize: boolean;
  chunkSizeInBytes: number;
  parallelDownloads: number;
  retryAttempts: number;
}

export const DEFAULT_CHUNKED_DOWNLOAD_SETTINGS: ChunkedDownloadSettings = {
  useAutomaticChunkSize: false,
  chunkSizeInBytes: DEFAULT_CHUNK_SIZE,
  parallelDownloads: 3,
  retryAttempts: 3,
};

export function sanitizeChunkedDownloadSettings(
  value?: Partial<ChunkedDownloadSettings> | null
): ChunkedDownloadSettings {
  const chunkSizeInBytes = Number(value?.chunkSizeInBytes);
  const parallelDownloads = Number(value?.parallelDownloads);
  const retryAttempts = Number(value?.retryAttempts);

  return {
    useAutomaticChunkSize: Boolean(value?.useAutomaticChunkSize),
    chunkSizeInBytes: Number.isFinite(chunkSizeInBytes) && chunkSizeInBytes > 0
      ? Math.round(chunkSizeInBytes)
      : DEFAULT_CHUNKED_DOWNLOAD_SETTINGS.chunkSizeInBytes,
    parallelDownloads: Number.isFinite(parallelDownloads) && parallelDownloads > 0
      ? Math.round(parallelDownloads)
      : DEFAULT_CHUNKED_DOWNLOAD_SETTINGS.parallelDownloads,
    retryAttempts: Number.isFinite(retryAttempts) && retryAttempts > 0
      ? Math.round(retryAttempts)
      : DEFAULT_CHUNKED_DOWNLOAD_SETTINGS.retryAttempts,
  };
}

export function loadChunkedDownloadSettings(): ChunkedDownloadSettings {
  if (typeof window === "undefined") {
    return DEFAULT_CHUNKED_DOWNLOAD_SETTINGS;
  }

  try {
    const rawValue = window.localStorage.getItem(CHUNKED_DOWNLOAD_SETTINGS_STORAGE_KEY);
    if (!rawValue) {
      return DEFAULT_CHUNKED_DOWNLOAD_SETTINGS;
    }

    return sanitizeChunkedDownloadSettings(JSON.parse(rawValue) as Partial<ChunkedDownloadSettings>);
  } catch {
    return DEFAULT_CHUNKED_DOWNLOAD_SETTINGS;
  }
}

export function saveChunkedDownloadSettings(settings: ChunkedDownloadSettings): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    CHUNKED_DOWNLOAD_SETTINGS_STORAGE_KEY,
    JSON.stringify(sanitizeChunkedDownloadSettings(settings))
  );
}
