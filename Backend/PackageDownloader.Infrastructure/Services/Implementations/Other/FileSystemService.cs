using PackageDownloader.Infrastructure.Services.Abstractions;
using System.Reflection;

namespace PackageDownloader.Infrastructure.Services.Implementations;

public class FileSystemService : IFileSystemService
{
    private string GetRandomTempFolderPath()
    {
        string timeStamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString();
        string randomFolderName = Path.GetRandomFileName() + timeStamp;
        string currentPath = Path.GetDirectoryName(Assembly.GetEntryAssembly()?.Location) ?? 
            Path.GetTempPath();

        return Path.Combine(currentPath, randomFolderName);
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

    public string CreateDirectory(string baseFolderPath, string directoryName)
    {
        string folerForPackagesPath = Path.Combine(baseFolderPath,directoryName);
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
