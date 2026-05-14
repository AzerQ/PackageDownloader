using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using PackageDownloader.Core.Models;
using PackageDownloader.Core.Services.Abstractions;

namespace PackageDownloader.Persistence.Services;

public class CachedPackagesStorageService : IPackagesStorageService
{
    private readonly IMemoryCache _memoryCache;
    private readonly ILogger<CachedPackagesStorageService>? _logger;
    
    const int CacheLiveTimeInMinutes = 60;

    public CachedPackagesStorageService(IMemoryCache memoryCache, ILogger<CachedPackagesStorageService>? logger = null)
    {
        _memoryCache = memoryCache;
        _logger = logger;
    }
    
    public PackagesEntryFileMetaInfo? GetPackagesArchiveEntry(Guid packageArchiveId)
    {
        return _memoryCache.Get<PackagesEntryFileMetaInfo>(packageArchiveId);
    }

    public PackagesEntryFileMetaInfo CreatePackagesArchiveEntry(
        string packageArchivePath, 
        PackageRequest packageRequest,
        Func<string, string> mimeTypeResolver)
    {
        var packagesEntryFileMetaInfo = new PackagesEntryFileMetaInfo(packageArchivePath, packageRequest, mimeTypeResolver);
        var cacheKey = packagesEntryFileMetaInfo.Id;
        
        // Configure cache entry with post-eviction callback to delete the file
        var cacheEntryOptions = new MemoryCacheEntryOptions()
            .SetAbsoluteExpiration(TimeSpan.FromMinutes(CacheLiveTimeInMinutes))
            .RegisterPostEvictionCallback((evictedKey, value, reason, state) =>
            {
                // Delete the file when cache entry is evicted
                if (value is PackagesEntryFileMetaInfo entryFileMetaInfo && !string.IsNullOrEmpty(entryFileMetaInfo.Path))
                {
                    try
                    {
                        if (File.Exists(entryFileMetaInfo.Path))
                        {
                            File.Delete(entryFileMetaInfo.Path);
                            _logger?.LogInformation("Deleted expired package archive: {FilePath} (Reason: {EvictionReason})", 
                                entryFileMetaInfo.Path, reason);
                        }
                    }
                    catch (Exception ex)
                    {
                        // Log the error but don't throw - cleanup failure shouldn't break the app
                        _logger?.LogError(ex, "Failed to delete expired package archive: {FilePath}", entryFileMetaInfo.Path);
                    }
                }
            });
        
        _memoryCache.Set(cacheKey, packagesEntryFileMetaInfo, cacheEntryOptions);
        
        _logger?.LogDebug("Package archive cached with ID {ArchiveId}, expires in {Minutes} minutes", 
            cacheKey, CacheLiveTimeInMinutes);
        
        return packagesEntryFileMetaInfo;
    }
}