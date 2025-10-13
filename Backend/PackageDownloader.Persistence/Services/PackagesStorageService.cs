using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
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
    
    public string? GetPackagesArchivePath(Guid packageArchiveId)
    {
        return _memoryCache.Get(packageArchiveId) as string;
    }

    public Guid SetPackagesArchivePath(string packageArchivePath)
    {
        var key = Guid.NewGuid();
        
        // Configure cache entry with post-eviction callback to delete the file
        var cacheEntryOptions = new MemoryCacheEntryOptions()
            .SetAbsoluteExpiration(TimeSpan.FromMinutes(CacheLiveTimeInMinutes))
            .RegisterPostEvictionCallback((evictedKey, value, reason, state) =>
            {
                // Delete the file when cache entry is evicted
                if (value is string filePath && !string.IsNullOrEmpty(filePath))
                {
                    try
                    {
                        if (File.Exists(filePath))
                        {
                            File.Delete(filePath);
                            _logger?.LogInformation("Deleted expired package archive: {FilePath} (Reason: {EvictionReason})", 
                                filePath, reason);
                        }
                    }
                    catch (Exception ex)
                    {
                        // Log the error but don't throw - cleanup failure shouldn't break the app
                        _logger?.LogError(ex, "Failed to delete expired package archive: {FilePath}", filePath);
                    }
                }
            });
        
        _memoryCache.Set(key, packageArchivePath, cacheEntryOptions);
        
        _logger?.LogDebug("Package archive cached with ID {ArchiveId}, expires in {Minutes} minutes", 
            key, CacheLiveTimeInMinutes);
        
        return key;
    }
}