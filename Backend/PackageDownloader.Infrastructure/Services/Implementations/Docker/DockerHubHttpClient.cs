using System.Net.Http.Headers;
using System.Text.Json;
using PackageDownloader.Core.Models.Docker;
using PackageDownloader.Infrastructure.Services.Abstractions;

namespace PackageDownloader.Infrastructure.Services.Implementations.Docker;

/// <summary>
/// Docker Hub HTTP client implementation
/// </summary>
public class DockerHubHttpClient : IDockerHubHttpClient
{
    private readonly HttpClient _httpClient;
    private const string DockerHubApiBaseUrl = "https://hub.docker.com/v2/";
    private const string DockerRegistryBaseUrl = "https://registry-1.docker.io/v2/";

    public DockerHubHttpClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
        _httpClient.DefaultRequestHeaders.Add("User-Agent", "PackageDownloader/1.0");
    }

    public async Task<DockerHubSearchResponse> SearchImagesAsync(string query, int page = 1, int pageSize = 25)
    {
        var url = $"{DockerHubApiBaseUrl}search/repositories/?query={Uri.EscapeDataString(query)}&page={page}&page_size={pageSize}";
        
        var response = await _httpClient.GetAsync(url);
        response.EnsureSuccessStatusCode();
        
        var jsonString = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<DockerHubSearchResponse>(jsonString, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });
        
        return result ?? new DockerHubSearchResponse();
    }

    public async Task<DockerHubTagsResponse> GetImageTagsAsync(string repository, int page = 1, int pageSize = 100)
    {
        // Handle official images (e.g., "nginx" -> "library/nginx")
        if (!repository.Contains('/'))
        {
            repository = $"library/{repository}";
        }

        var url = $"{DockerHubApiBaseUrl}repositories/{repository}/tags/?page={page}&page_size={pageSize}";
        
        var response = await _httpClient.GetAsync(url);
        response.EnsureSuccessStatusCode();
        
        var jsonString = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<DockerHubTagsResponse>(jsonString, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });
        
        return result ?? new DockerHubTagsResponse();
    }

    public async Task<DockerManifest> GetImageManifestAsync(string repository, string tag)
    {
        // Handle official images
        if (!repository.Contains('/'))
        {
            repository = $"library/{repository}";
        }

        // Get authentication token first
        var token = await GetRegistryTokenAsync(repository);
        
        var url = $"{DockerRegistryBaseUrl}{repository}/manifests/{tag}";
        
        using var request = new HttpRequestMessage(HttpMethod.Get, url);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        
        // Accept both manifest list and regular manifest
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/vnd.docker.distribution.manifest.v2+json"));
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/vnd.oci.image.manifest.v1+json"));
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/vnd.oci.image.index.v1+json"));
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/vnd.docker.distribution.manifest.list.v2+json"));
        
        var response = await _httpClient.SendAsync(request);
        response.EnsureSuccessStatusCode();
        
        var jsonString = await response.Content.ReadAsStringAsync();
        
        // Check if it's a manifest list (multi-platform)
        using var doc = JsonDocument.Parse(jsonString);
        var root = doc.RootElement;
        
        if (root.TryGetProperty("manifests", out _))
        {
            // This is a manifest list - get the first linux/amd64 manifest
            var manifestList = JsonSerializer.Deserialize<DockerManifestList>(jsonString, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });
            
            if (manifestList == null || !manifestList.Manifests.Any())
            {
                throw new InvalidOperationException("Manifest list is empty");
            }
            
            // Try to find linux/amd64 manifest first
            var preferredManifest = manifestList.Manifests.FirstOrDefault(m => 
                m.Platform?.Os == "linux" && 
                m.Platform?.Architecture == "amd64") 
                ?? manifestList.Manifests.First();
            
            // Fetch the actual manifest using the digest
            return await GetImageManifestByDigestAsync(repository, preferredManifest.Digest, token);
        }
        
        // It's a regular manifest, parse it directly
        var manifest = JsonSerializer.Deserialize<DockerManifest>(jsonString, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });
        
        return manifest ?? throw new InvalidOperationException("Failed to parse Docker manifest");
    }

    private async Task<DockerManifest> GetImageManifestByDigestAsync(string repository, string digest, string token)
    {
        var url = $"{DockerRegistryBaseUrl}{repository}/manifests/{digest}";
        
        using var request = new HttpRequestMessage(HttpMethod.Get, url);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/vnd.docker.distribution.manifest.v2+json"));
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/vnd.oci.image.manifest.v1+json"));
        
        var response = await _httpClient.SendAsync(request);
        response.EnsureSuccessStatusCode();
        
        var jsonString = await response.Content.ReadAsStringAsync();
        var manifest = JsonSerializer.Deserialize<DockerManifest>(jsonString, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });
        
        return manifest ?? throw new InvalidOperationException("Failed to parse Docker manifest");
    }

    public async Task<string> DownloadLayerAsync(string repository, string digest, string outputPath)
    {
        // Handle official images
        if (!repository.Contains('/'))
        {
            repository = $"library/{repository}";
        }

        var token = await GetRegistryTokenAsync(repository);
        var url = $"{DockerRegistryBaseUrl}{repository}/blobs/{digest}";
        
        using var request = new HttpRequestMessage(HttpMethod.Get, url);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        
        var response = await _httpClient.SendAsync(request);
        response.EnsureSuccessStatusCode();
        
        Directory.CreateDirectory(Path.GetDirectoryName(outputPath)!);
        
        await using var fileStream = new FileStream(outputPath, FileMode.Create);
        await using var responseStream = await response.Content.ReadAsStreamAsync();
        await responseStream.CopyToAsync(fileStream);
        
        return outputPath;
    }

    /// <summary>
    /// Download complete Docker image with all layers as tar.gz archive
    /// </summary>
    /// <remarks>
    /// Downloads the complete Docker image including config and all layers.
    /// The result is a Docker-compatible tar.gz archive that can be loaded with 'docker load'.
    /// Note: Docker images can be very large (several GB).
    /// </remarks>
    /// <param name="repository">Repository name</param>
    /// <param name="tag">Image tag</param>
    /// <param name="outputPath">Output directory path</param>
    /// <returns>Path to the downloaded tar.gz archive</returns>
    public async Task<string> DownloadImageAsync(string repository, string tag, string outputPath)
    {
        var manifest = await GetImageManifestAsync(repository, tag);
        
        var imageName = repository.Replace("/", "_");
        var archiveName = $"{imageName}_{tag}.tar.gz";
        var fullOutputPath = Path.Combine(outputPath, archiveName);
        
        Directory.CreateDirectory(outputPath);
        
        // Create a temporary directory for layers
        var tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());
        Directory.CreateDirectory(tempDir);
        
        try
        {
            // Download config blob
            var configPath = Path.Combine(tempDir, "config.json");
            await DownloadLayerAsync(repository, manifest.Config.Digest, configPath);
            
            // Download all layers
            var layerPaths = new List<string>();
            var layerIndex = 0;
            foreach (var layer in manifest.Layers)
            {
                // Use sequential numbering for layer files
                var layerFileName = $"layer_{layerIndex:D3}.tar.gz";
                var layerPath = Path.Combine(tempDir, layerFileName);
                await DownloadLayerAsync(repository, layer.Digest, layerPath);
                layerPaths.Add(layerFileName);
                layerIndex++;
            }
            
            // Create manifest.json for Docker image
            var imageManifest = new[]
            {
                new
                {
                    Config = "config.json",
                    RepoTags = new[] { $"{repository}:{tag}" },
                    Layers = layerPaths.ToArray()
                }
            };
            
            var manifestJson = JsonSerializer.Serialize(imageManifest, new JsonSerializerOptions { WriteIndented = true });
            await File.WriteAllTextAsync(Path.Combine(tempDir, "manifest.json"), manifestJson);
            
            // Create repositories file (optional but good for compatibility)
            var repositories = new Dictionary<string, Dictionary<string, string>>
            {
                [repository] = new Dictionary<string, string> { [tag] = manifest.Config.Digest }
            };
            var repositoriesJson = JsonSerializer.Serialize(repositories, new JsonSerializerOptions { WriteIndented = true });
            await File.WriteAllTextAsync(Path.Combine(tempDir, "repositories"), repositoriesJson);
            
            // Create tar.gz archive
            await CreateTarGzArchiveAsync(tempDir, fullOutputPath);
            
            return fullOutputPath;
        }
        finally
        {
            // Cleanup temporary directory
            if (Directory.Exists(tempDir))
            {
                try
                {
                    Directory.Delete(tempDir, true);
                }
                catch
                {
                    // Ignore cleanup errors
                }
            }
        }
    }

    private async Task<string> GetRegistryTokenAsync(string repository)
    {
        var tokenUrl = $"https://auth.docker.io/token?service=registry.docker.io&scope=repository:{repository}:pull";
        
        var response = await _httpClient.GetAsync(tokenUrl);
        response.EnsureSuccessStatusCode();
        
        var jsonString = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(jsonString);
        
        return doc.RootElement.GetProperty("token").GetString() ?? 
               throw new InvalidOperationException("Failed to get Docker registry token");
    }

    private static async Task CreateTarGzArchiveAsync(string sourceDir, string outputPath)
    {
        // Create a proper tar.gz archive compatible with Docker
        await using var fileStream = new FileStream(outputPath, FileMode.Create);
        await using var gzipStream = new System.IO.Compression.GZipStream(fileStream, System.IO.Compression.CompressionLevel.Optimal);
        await using var tarWriter = new System.Formats.Tar.TarWriter(gzipStream);
        
        var files = Directory.GetFiles(sourceDir, "*", SearchOption.AllDirectories);
        
        foreach (var file in files)
        {
            var relativePath = Path.GetRelativePath(sourceDir, file);
            // Use forward slashes for tar format
            relativePath = relativePath.Replace('\\', '/');
            
            // Create a tar entry
            await using var fileToCompress = File.OpenRead(file);
            var entry = new System.Formats.Tar.PaxTarEntry(System.Formats.Tar.TarEntryType.RegularFile, relativePath)
            {
                DataStream = fileToCompress,
                ModificationTime = File.GetLastWriteTimeUtc(file)
            };
            
            await tarWriter.WriteEntryAsync(entry);
        }
    }
}