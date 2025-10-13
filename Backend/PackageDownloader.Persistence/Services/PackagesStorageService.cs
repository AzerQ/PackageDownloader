using Microsoft.Extensions.Caching.Memory;
using PackageDownloader.Core.Services.Abstractions;

namespace PackageDownloader.Persistence.Services;

public class CachedPackagesStorageService (IMemoryCache memoryCache) : IPackagesStorageService
{
    
    const int CacheLiveTimeInMinutes = 10;
    
    public string? GetPackagesArchivePath(Guid packageArchiveId)
    {
        return memoryCache.Get(packageArchiveId) as string;
    }

    public Guid SetPackagesArchivePath(string packageArchivePath)
    {
        var key = Guid.NewGuid();
        memoryCache.Set(key, packageArchivePath, TimeSpan.FromMinutes(CacheLiveTimeInMinutes));
        
        return key;
    }
}