namespace PackageDownloader.Core.Services.Abstractions;

public interface IPackagesStorageService
{
    public string? GetPackagesArchivePath(Guid packageArchiveId);
    
    Guid SetPackagesArchivePath(string packageArchivePath);
}