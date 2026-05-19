import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { PackageDownloadAsChunksButton } from "./AlternativePackageDownloadButton";

const { getPackageApiClientMock } = vi.hoisted(() => ({
  getPackageApiClientMock: vi.fn(),
}));

const downloadMock = vi.fn();
const cancelMock = vi.fn();
const resetMock = vi.fn();

vi.mock("./useChunkedDownload", () => ({
  useChunkedDownload: () => ({
    isSupported: true,
    isDownloading: false,
    isCompleted: false,
    progress: null,
    error: null,
    download: downloadMock,
    cancel: cancelMock,
    reset: resetMock,
  }),
}));

vi.mock("../../services/apiClient", () => ({
  DEFAULT_CHUNK_SIZE: 1024 * 70,
  getPackageApiClient: getPackageApiClientMock,
}));

describe("PackageDownloadAsChunksButton", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
    getPackageApiClientMock.mockResolvedValue({
      getChunksInfo: vi.fn().mockResolvedValue({
        fileName: "real-archive.zip",
        totalSizeInBytes: 10,
        chunkSizeInBytes: 5,
        totalChunks: 2,
        mimeType: "application/zip",
      }),
    });
  });

  it("loads settings from localStorage and starts download with them", async () => {
    window.localStorage.setItem(
      "package_downloader_chunked_download_settings",
      JSON.stringify({
        useAutomaticChunkSize: true,
        chunkSizeInBytes: 999999,
        parallelDownloads: 5,
        retryAttempts: 4,
        saveMethod: "browser",
      })
    );
    const user = userEvent.setup();

    render(<PackageDownloadAsChunksButton packagesArchiveId="archive-id" />);

    expect(screen.getByTestId("chunked-download-settings-summary")).toHaveTextContent("Параллельно: 5");
    await user.click(screen.getByTestId("chunked-download-open-settings"));
    await user.click(screen.getByTestId("chunked-download-start"));

    expect(resetMock).toHaveBeenCalledTimes(1);
    expect(downloadMock).toHaveBeenCalledWith("archive-id", {
      useAutomaticChunkSize: true,
      chunkSizeInBytes: 999999,
      parallelDownloads: 5,
      retryAttempts: 4,
      saveMethod: "browser",
    }, undefined, expect.objectContaining({ fileName: "real-archive.zip" }));
  });

  it("updates settings and persists them", async () => {
    const user = userEvent.setup();

    render(<PackageDownloadAsChunksButton packagesArchiveId="archive-id" />);

    await user.click(screen.getByTestId("chunked-download-open-settings"));
    fireEvent.change(screen.getByLabelText("Одновременных скачиваний"), { target: { value: "7" } });
    await user.click(screen.getByRole("button", { name: "Закрыть" }));

    expect(screen.getByTestId("chunked-download-settings-summary")).toHaveTextContent("Параллельно: 7");
    expect(window.localStorage.getItem("package_downloader_chunked_download_settings")).toContain("\"parallelDownloads\":7");
  });

  it("updates save method and persists it", async () => {
    const user = userEvent.setup();

    render(<PackageDownloadAsChunksButton packagesArchiveId="archive-id" />);

    await user.click(screen.getByTestId("chunked-download-open-settings"));
    await user.click(screen.getByRole("button", { name: "Стандартная загрузка через браузер" }));
    await user.click(screen.getByTestId("chunked-download-start"));

    expect(downloadMock).toHaveBeenCalledWith(
      "archive-id",
      expect.objectContaining({ saveMethod: "browser" }),
      undefined,
      expect.objectContaining({ fileName: "real-archive.zip" })
    );
    expect(window.localStorage.getItem("package_downloader_chunked_download_settings")).toContain("\"saveMethod\":\"browser\"");
  });
});
