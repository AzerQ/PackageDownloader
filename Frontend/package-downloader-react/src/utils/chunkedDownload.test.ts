import { vi } from "vitest";
import { chunkedDownload } from "./chunkedDownload";

const { getPackageApiClientMock } = vi.hoisted(() => ({
  getPackageApiClientMock: vi.fn(),
}));

vi.mock("../services/apiClient", () => ({
  DEFAULT_CHUNK_SIZE: 1024 * 70,
  getPackageApiClient: getPackageApiClientMock,
}));

async function readBlobAsText(blob: Blob): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });
}

describe("chunkedDownload", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:test"),
      revokeObjectURL: vi.fn(),
    });
  });

  it("downloads chunks in memory and writes a single blob", async () => {
    const writeMock = vi.fn();
    const closeMock = vi.fn();
    const showSaveFilePickerMock = vi.fn(async () => ({
      createWritable: async () => ({
        write: writeMock,
        close: closeMock,
      }),
    }));
    Object.defineProperty(window, "showSaveFilePicker", {
      configurable: true,
      value: showSaveFilePickerMock,
    });

    const getChunkMock = vi
      .fn()
      .mockImplementation(async (_archiveId: string, chunkIndex: number) => {
        const chunks = ["AA", "BB", "CC"];
        return new TextEncoder().encode(chunks[chunkIndex]).buffer;
      });

    getPackageApiClientMock.mockResolvedValue({
      getChunksInfo: vi.fn().mockResolvedValue({
        fileName: "archive.zip",
        totalSizeInBytes: 6,
        chunkSizeInBytes: 2,
        totalChunks: 3,
        mimeType: "application/zip",
      }),
      getChunk: getChunkMock,
    });

    const progressEvents: number[] = [];

    await chunkedDownload({
      packagesArchiveId: "archive-id",
      parallelDownloads: 2,
      retryAttempts: 3,
      onProgress: (event) => progressEvents.push(event.currentChunk),
    });

    expect(getChunkMock).toHaveBeenCalledTimes(3);
    expect(progressEvents).toEqual([1, 2, 3]);
    expect(writeMock).toHaveBeenCalledTimes(1);
    const blob = writeMock.mock.calls[0][0] as Blob;
    expect(await readBlobAsText(blob)).toBe("AABBCC");
    expect(closeMock).toHaveBeenCalledTimes(1);
  });

  it("retries failed chunks before succeeding", async () => {
    let attempts = 0;
    Object.defineProperty(window, "showSaveFilePicker", {
      configurable: true,
      value: undefined,
    });

    getPackageApiClientMock.mockResolvedValue({
      getChunksInfo: vi.fn().mockResolvedValue({
        fileName: "archive.zip",
        totalSizeInBytes: 2,
        chunkSizeInBytes: 2,
        totalChunks: 1,
        mimeType: "application/zip",
      }),
      getChunk: vi.fn().mockImplementation(async () => {
        attempts += 1;
        if (attempts < 3) {
          throw new Error("temporary");
        }

        return new TextEncoder().encode("OK").buffer;
      }),
    });

    const originalCreateElement = document.createElement.bind(document);
    const createElementSpy = vi.spyOn(document, "createElement");
    const clickMock = vi.fn();
    createElementSpy.mockImplementation(((tagName: string) => {
      if (tagName === "a") {
        return {
          click: clickMock,
          set href(_value: string) {},
          set download(_value: string) {},
        } as unknown as HTMLAnchorElement;
      }

      return originalCreateElement(tagName);
    }) as typeof document.createElement);

    await chunkedDownload({
      packagesArchiveId: "archive-id",
      retryAttempts: 3,
    });

    expect(attempts).toBe(3);
    expect(clickMock).toHaveBeenCalledTimes(1);
  });

  it("stops when aborted", async () => {
    const abortController = new AbortController();
    abortController.abort();

    getPackageApiClientMock.mockResolvedValue({
      getChunksInfo: vi.fn(),
      getChunk: vi.fn(),
    });

    await expect(
      chunkedDownload({
        packagesArchiveId: "archive-id",
        signal: abortController.signal,
      })
    ).rejects.toMatchObject({ name: "AbortError" });
  });
});
