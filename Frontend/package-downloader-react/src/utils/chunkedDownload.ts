import { DEFAULT_CHUNK_SIZE, getPackageApiClient, PackagesEntryChunksInfo } from "../services/apiClient";

export interface DownloadProgressEvent {
  loaded: number;
  total: number;
  percent: number;
  currentChunk: number;
  totalChunks: number;
}

export interface ChunkedDownloadOptions {
  packagesArchiveId: string;
  chunkSizeInBytes?: number;
  parallelDownloads?: number;
  retryAttempts?: number;
  saveMethod?: "fileApi" | "browser";
  onProgress?: (event: DownloadProgressEvent) => void;
  signal?: AbortSignal;
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw new DOMException('Загрузка отменена', 'AbortError');
  }
}

async function saveBlobWithFileApi(blob: Blob, fileName: string, mimeType: string): Promise<void> {
  if (typeof window === "undefined" || typeof window.showSaveFilePicker !== "function") {
    throw new Error("File API сохранение не поддерживается в этом браузере");
  }

  const extension = `.${fileName.split('.').pop() ?? ''}`;
  const fileHandle = await window.showSaveFilePicker({
    suggestedName: fileName,
    types: [
      {
        description: mimeType,
        accept: { [mimeType]: [extension] },
      },
    ],
  });
  const writable = await fileHandle.createWritable();
  await writable.write(blob);
  await writable.close();
}

function saveBlobWithBrowserDownload(blob: Blob, fileName: string): void {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(objectUrl);
}

async function saveBlobToClient(
  blob: Blob,
  fileName: string,
  mimeType: string,
  saveMethod: "fileApi" | "browser"
): Promise<void> {
  if (saveMethod === "fileApi") {
    await saveBlobWithFileApi(blob, fileName, mimeType);
    return;
  }

  saveBlobWithBrowserDownload(blob, fileName);
}

export async function chunkedDownload({
  packagesArchiveId,
  chunkSizeInBytes = DEFAULT_CHUNK_SIZE,
  parallelDownloads = 3,
  retryAttempts = 3,
  saveMethod = "fileApi",
  onProgress,
  signal,
}: ChunkedDownloadOptions): Promise<void> {
  throwIfAborted(signal);

  const { getChunk, getChunksInfo } = await getPackageApiClient();

  const info: PackagesEntryChunksInfo = await getChunksInfo(
    packagesArchiveId,
    chunkSizeInBytes
  );
  const chunks = new Array<ArrayBuffer>(info.totalChunks);
  const maxParallelDownloads = Math.max(1, Math.min(parallelDownloads, info.totalChunks));
  const maxAttempts = Math.max(1, retryAttempts);
  let loadedBytes = 0;
  let completedChunks = 0;
  let nextChunkIndex = 0;

  const downloadChunk = async (chunkIndex: number): Promise<void> => {
    let attempt = 0;

    while (attempt < maxAttempts) {
      throwIfAborted(signal);

      try {
        const chunk = await getChunk(
          packagesArchiveId,
          chunkIndex,
          info.chunkSizeInBytes,
          signal
        );

        chunks[chunkIndex] = chunk;
        loadedBytes += chunk.byteLength;
        completedChunks += 1;
        const totalBytes = Math.max(info.totalSizeInBytes, 1);
        onProgress?.({
          loaded: loadedBytes,
          total: info.totalSizeInBytes,
          percent: Math.min(100, Math.round((loadedBytes / totalBytes) * 100)),
          currentChunk: completedChunks,
          totalChunks: info.totalChunks,
        });
        return;
      } catch (error) {
        attempt += 1;
        if (error instanceof DOMException && error.name === "AbortError") {
          throw error;
        }

        if (attempt >= maxAttempts) {
          throw error;
        }
      }
    }
  };

  const runWorker = async (): Promise<void> => {
    while (nextChunkIndex < info.totalChunks) {
      throwIfAborted(signal);
      const chunkIndex = nextChunkIndex;
      nextChunkIndex += 1;
      await downloadChunk(chunkIndex);
    }
  };

  await Promise.all(
    Array.from({ length: maxParallelDownloads }, () => runWorker())
  );

  throwIfAborted(signal);

  const fileBlob = new Blob(chunks, { type: info.mimeType });
  await saveBlobToClient(fileBlob, info.fileName, info.mimeType, saveMethod);
}
