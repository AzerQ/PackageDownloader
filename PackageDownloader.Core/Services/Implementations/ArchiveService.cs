using PackageDownloader.Core.Services.Abstractions;
using System.IO.Compression;

namespace PackageDownloader.Core.Services.Implementations;

public class ArchiveService : IArchiveService
{
    public string ArchiveFolder(string folderPath, string outputFolder)
    {
        string archiveFileName = Path.GetFileNameWithoutExtension(folderPath) + ".zip";
        string archiveFilePath = Path.Combine(outputFolder, archiveFileName);

        ZipFile.CreateFromDirectory(folderPath, archiveFilePath);
        
        return archiveFilePath;
    }
}

