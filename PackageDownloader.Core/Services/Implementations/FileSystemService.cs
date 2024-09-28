using PackageDownloader.Core.Services.Abstractions;

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

    public string CreateDirectoryForPackage(string baseFolderPath, string packageID, string? pacakgeVersion)
    {
        string folerForPackagesPath = Path.Combine(baseFolderPath, packageID, pacakgeVersion ?? string.Empty);
        Directory.CreateDirectory(folerForPackagesPath);
        return folerForPackagesPath;
    }

    public void CopyFilesToFolder(IEnumerable<string> filePaths, string destinationFolder)
    {
        foreach (var file in filePaths)
        {
            string destinationPath = Path.Combine(destinationFolder, Path.GetFileName(file));
            File.Copy(file, destinationPath);
        }
    }

    public IEnumerable<string> GetAllFilesByExtension(string folder, string extension)
    {
        return Directory.GetFiles(folder, $"*.{extension}", SearchOption.AllDirectories);
    }

    public void RemoveDirectoryItemsByFilter(string directoryPath, Func<string, bool> itemsFilter)
    {

        var filesForRemove = Directory.GetFiles(directoryPath)
                                      .Where(itemsFilter)
                                      .ToList();

        var directoriesForRemove = Directory.GetDirectories(directoryPath)
                                      .Where(itemsFilter)
                                      .ToList();

        filesForRemove.ForEach(file => File.Delete(file));
        directoriesForRemove.ForEach(directory => Directory.Delete(directory, recursive: true));

    }
}
