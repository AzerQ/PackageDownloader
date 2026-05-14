using PackageDownloader.Core.Models;

namespace PackageDownloader.Core.Models;

public class PackagesEntryFileMetaInfo
{
    public Guid Id { get; }
    public PackageRequest SourceRequest { get; } 
    public string MimeType { get; } 
    public long SizeInBytes { get; }
    public string Path {get;}
    public string FileName {get;}

    public PackagesEntryFileMetaInfo(string packagesFilePath, PackageRequest sourceRequest, Func<string, string> mimeTypeResolver) {
        Id = Guid.NewGuid();
        SourceRequest = sourceRequest;
        var packagesFileInfo = new FileInfo(packagesFilePath);
        MimeType = mimeTypeResolver(packagesFilePath);
        SizeInBytes = packagesFileInfo.Length;
        Path = packagesFilePath;
        FileName =  packagesFileInfo.Name;
    }

    public PackagesEntryChunksInfo GetChunksInformation(int chunkSizeInBytes) {
        var totalChunks = (int)Math.Ceiling((double)SizeInBytes / chunkSizeInBytes);
        return new PackagesEntryChunksInfo
                    (
                        FileName: FileName, 
                        TotalSizeInBytes: SizeInBytes, 
                        ChunkSizeInBytes: chunkSizeInBytes,
                        TotalChunks: totalChunks,
                        MimeType: MimeType 
                    );
    }

    public async Task<byte[]> ReadChunk(int chunkIndex, int chunkSizeInBytes) {
        await using FileStream stream = File.OpenRead(Path);
        var offset = (long)chunkIndex * chunkSizeInBytes;
        if (offset >= stream.Length)
            throw new IndexOutOfRangeException("Chunk index out of range");
    
        var actualChunkSize = (int)Math.Min(chunkSizeInBytes, stream.Length - offset);
        byte[] buffer = new byte[actualChunkSize];

        stream.Seek(offset, SeekOrigin.Begin);
        await stream.ReadExactlyAsync(buffer, 0, actualChunkSize);
        return buffer;
    }

}

