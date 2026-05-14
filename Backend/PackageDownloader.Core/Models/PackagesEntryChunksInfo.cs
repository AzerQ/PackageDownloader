namespace PackageDownloader.Core.Models;

public record PackagesEntryChunksInfo(string FileName, long TotalSizeInBytes, long ChunkSizeInBytes, int TotalChunks, string MimeType);

