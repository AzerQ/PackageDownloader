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
  onProgress?: (event: DownloadProgressEvent) => void;
  signal?: AbortSignal;
}

export async function chunkedDownload({
  packagesArchiveId,
  chunkSizeInBytes = DEFAULT_CHUNK_SIZE,
  onProgress,
  signal,
}: ChunkedDownloadOptions): Promise<void> {

    const {getChunk, getChunksInfo} = await getPackageApiClient();

  // 1. Получаем метаданные
  const info: PackagesEntryChunksInfo = await getChunksInfo(
    packagesArchiveId,
    chunkSizeInBytes
  );

  // 2. Открываем диалог сохранения
  const extension = `.${info.fileName.split('.').pop() ?? ''}`;
  const fileHandle = await window.showSaveFilePicker({
    suggestedName: info.fileName,
    types: [
      {
        description: info.mimeType,
        accept: { [info.mimeType]: [extension] },
      },
    ],
  });

  const writable = await fileHandle.createWritable();
  let loadedBytes = 0;

  try {
    for (let i = 0; i < info.totalChunks; i++) {
      // Проверяем отмену перед каждым чанком
      if (signal?.aborted) throw new DOMException('Загрузка отменена', 'AbortError');

      const chunk = await getChunk(
        packagesArchiveId,
        i,
        chunkSizeInBytes
      );

      await writable.write(chunk);

      loadedBytes += chunk.byteLength;
      onProgress?.({
        loaded: loadedBytes,
        total: info.totalSizeInBytes,
        percent: Math.round((loadedBytes / info.totalSizeInBytes) * 100),
        currentChunk: i + 1,
        totalChunks: info.totalChunks,
      });
    }
  } finally {
    await writable.close();
  }
}