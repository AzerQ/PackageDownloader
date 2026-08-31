using PackageDownloader.Infrastructure.Services.Abstractions;
using System.IO.Compression;

namespace PackageDownloader.Infrastructure.Services.Implementations;

public class ArchiveService : IArchiveService
{
    public string ArchiveFolder(string folderPath, string outputFolder)
    {
        // The folder name itself may contain dots (package ids, versions like "latest.source"),
        // so it must be taken as a whole instead of being treated as "name + extension"
        string archiveFileName = new DirectoryInfo(folderPath).Name + ".zip";
        string archiveFilePath = Path.Combine(outputFolder, archiveFileName);

        ZipFile.CreateFromDirectory(folderPath, archiveFilePath);
        
        return archiveFilePath;
    }
}

