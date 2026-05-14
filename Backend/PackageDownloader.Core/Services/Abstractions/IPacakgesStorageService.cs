using System.Threading.Tasks;
using PackageDownloader.Core.Models;

namespace PackageDownloader.Core.Services.Abstractions;

public interface IPackagesStorageService
{
    public PackagesEntryFileMetaInfo? GetPackagesArchiveEntry(Guid packageEntryId);
    
    PackagesEntryFileMetaInfo CreatePackagesArchiveEntry(string packageArchivePath, PackageRequest packageRequest, Func<string, string> mimeTypeResolver);
}

