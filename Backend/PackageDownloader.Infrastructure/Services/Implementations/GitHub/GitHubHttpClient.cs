using System.Net;
using System.Net.Http.Headers;
using System.Text.Json;
using PackageDownloader.Core.Models.GitHub;
using PackageDownloader.Infrastructure.Services.Abstractions;

namespace PackageDownloader.Infrastructure.Services.Implementations.GitHub;

/// <summary>
/// GitHub REST API client implementation
/// </summary>
public class GitHubHttpClient : IGitHubHttpClient
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private const string GitHubApiBaseUrl = "https://api.github.com/";
    private const int MaxPageSize = 100;

    private readonly HttpClient _httpClient;

    /// <param name="httpClient">Client used for all GitHub calls.</param>
    /// <param name="accessToken">
    /// Optional personal access token. Without it GitHub allows only 60 anonymous requests per hour.
    /// </param>
    public GitHubHttpClient(HttpClient httpClient, string? accessToken = null)
    {
        _httpClient = httpClient;
        _httpClient.DefaultRequestHeaders.UserAgent.ParseAdd("PackageDownloader/1.0");
        _httpClient.DefaultRequestHeaders.Accept.Add(
            new MediaTypeWithQualityHeaderValue("application/vnd.github+json"));
        _httpClient.DefaultRequestHeaders.Add("X-GitHub-Api-Version", "2022-11-28");

        if (!string.IsNullOrWhiteSpace(accessToken))
        {
            _httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", accessToken);
        }
    }

    public async Task<GitHubSearchResponse> SearchRepositoriesAsync(string query, int page = 1, int pageSize = 25)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(query);

        var url = $"{GitHubApiBaseUrl}search/repositories" +
                  $"?q={Uri.EscapeDataString(query)}&sort=stars&order=desc" +
                  $"&page={page}&per_page={Math.Clamp(pageSize, 1, MaxPageSize)}";

        var result = await GetJsonAsync<GitHubSearchResponse>(url);

        return result ?? new GitHubSearchResponse();
    }

    public Task<GitHubRepository?> GetRepositoryAsync(string repository) =>
        GetJsonAsync<GitHubRepository>($"{GitHubApiBaseUrl}repos/{NormalizeRepository(repository)}");

    public async Task<IReadOnlyList<GitHubRelease>> GetReleasesAsync(string repository, int maxCount = 100)
    {
        if (maxCount <= 0)
            return [];

        var normalizedRepository = NormalizeRepository(repository);
        var releases = new List<GitHubRelease>();

        for (var page = 1; releases.Count < maxCount; page++)
        {
            var pageSize = Math.Min(maxCount - releases.Count, MaxPageSize);
            var url = $"{GitHubApiBaseUrl}repos/{normalizedRepository}/releases?page={page}&per_page={pageSize}";

            var pageReleases = await GetJsonAsync<List<GitHubRelease>>(url);

            if (pageReleases is null || pageReleases.Count == 0)
                break;

            releases.AddRange(pageReleases.Where(release => !release.Draft));

            if (pageReleases.Count < pageSize)
                break;
        }

        return releases
            .OrderByDescending(release => release.ReleaseDate)
            .Take(maxCount)
            .ToList();
    }

    public Task<GitHubRelease?> GetLatestReleaseAsync(string repository) =>
        GetJsonAsync<GitHubRelease>($"{GitHubApiBaseUrl}repos/{NormalizeRepository(repository)}/releases/latest");

    public Task<GitHubRelease?> GetReleaseByTagAsync(string repository, string tag)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(tag);

        return GetJsonAsync<GitHubRelease>(
            $"{GitHubApiBaseUrl}repos/{NormalizeRepository(repository)}/releases/tags/{Uri.EscapeDataString(tag)}");
    }

    public async Task<string> DownloadAssetAsync(GitHubReleaseAsset asset, string outputDirectory)
    {
        Directory.CreateDirectory(outputDirectory);

        var outputPath = Path.Combine(outputDirectory, RemoveInvalidFileNameChars(asset.Name));

        await SaveFileAsync(asset.BrowserDownloadUrl, outputPath);

        return outputPath;
    }

    public async Task<string> DownloadSourceArchiveAsync(string repository, string? reference, string outputDirectory)
    {
        var normalizedRepository = NormalizeRepository(repository);

        reference ??= (await GetRepositoryAsync(normalizedRepository))?.DefaultBranch
                      ?? throw new InvalidOperationException(
                          $"Can't resolve default branch of the GitHub repository '{repository}'");

        Directory.CreateDirectory(outputDirectory);

        var archiveName = RemoveInvalidFileNameChars(
            $"{normalizedRepository.Replace('/', '_')}_{reference}_source.zip");
        var outputPath = Path.Combine(outputDirectory, archiveName);

        // The zipball endpoint accepts a branch, a tag or a commit sha and redirects to codeload.
        await SaveFileAsync(
            $"{GitHubApiBaseUrl}repos/{normalizedRepository}/zipball/{Uri.EscapeDataString(reference)}",
            outputPath);

        return outputPath;
    }

    private async Task<TResponse?> GetJsonAsync<TResponse>(string url) where TResponse : class
    {
        using var response = await _httpClient.GetAsync(url, HttpCompletionOption.ResponseHeadersRead);

        if (response.StatusCode == HttpStatusCode.NotFound)
            return null;

        await EnsureSuccessAsync(response);

        await using var stream = await response.Content.ReadAsStreamAsync();

        return await JsonSerializer.DeserializeAsync<TResponse>(stream, JsonOptions);
    }

    private async Task SaveFileAsync(string url, string outputPath)
    {
        using var response = await _httpClient.GetAsync(url, HttpCompletionOption.ResponseHeadersRead);
        await EnsureSuccessAsync(response);

        await using var responseStream = await response.Content.ReadAsStreamAsync();
        await using var fileStream = new FileStream(outputPath, FileMode.Create);
        await responseStream.CopyToAsync(fileStream);
    }

    private static async Task EnsureSuccessAsync(HttpResponseMessage response)
    {
        if (response.IsSuccessStatusCode)
            return;

        // GitHub answers 403/429 with a rate limit explanation that is worth showing to the user.
        var isRateLimited = response.StatusCode is HttpStatusCode.Forbidden or HttpStatusCode.TooManyRequests
                            && response.Headers.TryGetValues("X-RateLimit-Remaining", out var remaining)
                            && remaining.FirstOrDefault() == "0";

        if (isRateLimited)
        {
            throw new HttpRequestException(
                "GitHub API rate limit is exceeded. Set the 'GitHub:TOKEN' configuration value to raise the limit.",
                null,
                response.StatusCode);
        }

        var body = await response.Content.ReadAsStringAsync();

        throw new HttpRequestException(
            $"GitHub API request failed with status {(int)response.StatusCode}: {body}",
            null,
            response.StatusCode);
    }

    /// <summary>
    /// Accepts both the <c>owner/repo</c> form and a full repository URL.
    /// </summary>
    private static string NormalizeRepository(string repository)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(repository);

        repository = repository.Trim().TrimEnd('/');

        if (Uri.TryCreate(repository, UriKind.Absolute, out var repositoryUri))
            repository = repositoryUri.AbsolutePath.Trim('/');

        if (repository.EndsWith(".git", StringComparison.OrdinalIgnoreCase))
            repository = repository[..^4];

        var parts = repository.Split('/', StringSplitOptions.RemoveEmptyEntries);

        if (parts.Length < 2)
        {
            throw new ArgumentException(
                $"GitHub repository must be specified in the 'owner/repo' form, but was '{repository}'",
                nameof(repository));
        }

        return $"{parts[0]}/{parts[1]}";
    }

    private static string RemoveInvalidFileNameChars(string fileName) =>
        string.Concat(fileName.Split(Path.GetInvalidFileNameChars()));
}
