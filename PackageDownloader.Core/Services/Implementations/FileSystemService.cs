using PackageDownloader.Core.Services.Abstractions;
using System.IO.Compression;

namespace PackageDownloader.Core.Services.Implementations;

public class FileSystemService : IFileSystemService
{
    private string GetRandomTempFolderPath()
    {
        string timeStamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString();
        string randomFolderName = Path.GetRandomFileName() + timeStamp;
        return Path.Combine(Path.GetTempPath(), randomFolderName);
    }

    public string CreateTempFolder()
    {
        string path = GetRandomTempFolderPath();
        Directory.CreateDirectory(path);
        return path;
    }

    public void RemoveTempFolder(string folderPath)
    {
        Directory.Delete(folderPath, true);
    }

    public string ArchiveFolder(string folderPath)
    {
        string archiveFileName = Path.GetFileNameWithoutExtension(folderPath) + "_" + DateTimeOffset.UtcNow.ToUnixTimeSeconds() + ".zip";
        string upperFolder = Path.GetFullPath(Path.Combine(folderPath, @"..\"));
        string archiveFilePath = Path.Combine(upperFolder, archiveFileName);

        ZipFile.CreateFromDirectory(folderPath, archiveFilePath);

        return archiveFilePath;
    }
}
