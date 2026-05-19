import { useState, useCallback, useRef } from 'react';
import { chunkedDownload, DownloadProgressEvent } from '../../utils/chunkedDownload';
import { AUTO_CHUNK_SIZE_SENTINEL, ChunkedDownloadSettings } from './chunkedDownloadSettings';

interface DownloadState {
  isDownloading: boolean;
  progress: DownloadProgressEvent | null;
  error: string | null;
  isCompleted: boolean;
}

const INITIAL_STATE: DownloadState = {
  isDownloading: false,
  progress: null,
  error: null,
  isCompleted: false,
};

export function useChunkedDownload() {
  const [state, setState] = useState<DownloadState>(INITIAL_STATE);
  const abortControllerRef = useRef<AbortController | null>(null);

  const isSupported = typeof window !== 'undefined';

  const download = useCallback(async (packagesArchiveId: string, settings: ChunkedDownloadSettings) => {
    abortControllerRef.current = new AbortController();

    setState({ ...INITIAL_STATE, isDownloading: true });

    try {
      await chunkedDownload({
        packagesArchiveId,
        chunkSizeInBytes: settings.useAutomaticChunkSize ? AUTO_CHUNK_SIZE_SENTINEL : settings.chunkSizeInBytes,
        parallelDownloads: settings.parallelDownloads,
        retryAttempts: settings.retryAttempts,
        saveMethod: settings.saveMethod,
        signal: abortControllerRef.current.signal,
        onProgress: (progress) => {
          setState(prev => ({ ...prev, progress }));
        },
      });

      setState(prev => ({ ...prev, isDownloading: false, isCompleted: true }));
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setState(INITIAL_STATE);
        return;
      }

      setState(prev => ({
        ...prev,
        isDownloading: false,
        error: err instanceof Error ? err.message : 'Неизвестная ошибка',
      }));
    }
  }, []);

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  const reset = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  return { ...state, isSupported, download, cancel, reset };
}
