using System.Text.Json;
using PackageDownloader.Core.Models;
using PackageDownloader.Core.Services.Abstractions;
using PackageDownloader.Infrastructure.Services.Abstractions;

namespace PackageDownloader.Infrastructure.Services.Implementations.Other;

/// <summary>
/// Maps provider-specific JSON contracts to the common package model.
/// Results are materialized so the source JsonDocument can be disposed immediately.
/// </summary>
public sealed class PackageInfoConverterService : IPackageInfoConverterService
{
    private const string VsCodeLinkTemplate =
        "https://marketplace.visualstudio.com/items?itemName={0}.{1}";

    public IReadOnlyList<PackageInfo> ConvertNpmJsonToPackageInfo(JsonDocument json)
    {
        if (!TryGetArray(json.RootElement, "objects", out var objects)) return [];

        var packages = new List<PackageInfo>(objects.GetArrayLength());
        foreach (var item in objects.EnumerateArray())
        {
            var package = item.TryGetProperty("package", out var nestedPackage) ? nestedPackage : item;
            string id = GetString(package, "name");
            string repositoryUrl = GetNestedString(package, "links", "repository");
            if (repositoryUrl.StartsWith("git+", StringComparison.Ordinal)) repositoryUrl = repositoryUrl[4..];

            string packageUrl = GetNestedString(package, "links", "npm");
            if (packageUrl.Length == 0) packageUrl = $"https://www.npmjs.com/package/{id}";

            string version = GetString(package, "version");
            packages.Add(new PackageInfo
            {
                Id = id,
                CurrentVersion = version,
                Description = GetString(package, "description"),
                AuthorInfo = GetNpmAuthors(package),
                RepositoryUrl = repositoryUrl,
                PackageUrl = packageUrl,
                Tags = GetStringArray(package, "keywords"),
                OtherVersions = [version],
                DownloadsCount = GetNestedInt64(item, "downloads", "monthly")
            });
        }
        return packages;
    }

    public IReadOnlyList<PackageInfo> ConvertNugetJsonToPackageInfo(JsonDocument json)
    {
        if (!TryGetArray(json.RootElement, "data", out var data)) return [];

        var packages = new List<PackageInfo>(data.GetArrayLength());
        foreach (var item in data.EnumerateArray())
        {
            string id = GetString(item, "id");
            packages.Add(new PackageInfo
            {
                Id = id,
                CurrentVersion = GetString(item, "version"),
                Description = GetString(item, "description"),
                AuthorInfo = GetFirstString(item, "authors"),
                RepositoryUrl = GetString(item, "projectUrl"),
                PackageUrl = $"https://www.nuget.org/packages/{id}",
                Tags = GetStringArray(item, "tags"),
                OtherVersions = GetObjectStringArray(item, "versions", "version"),
                IconUrl = GetString(item, "iconUrl"),
                DownloadsCount = GetInt64(item, "totalDownloads")
            });
        }
        return packages;
    }

    public IReadOnlyList<PackageInfo> ConvertVsCodeJsonToPackageInfo(JsonDocument json)
    {
        if (!TryGetFirstVsCodeExtensions(json.RootElement, out var extensions)) return [];

        var packages = new List<PackageInfo>(extensions.GetArrayLength());
        foreach (var extension in extensions.EnumerateArray())
        {
            string authorId = GetNestedString(extension, "publisher", "publisherName");
            string packageName = GetString(extension, "extensionName");
            string version = "", sourceUrl = "", iconUrl = "";
            if (TryGetArray(extension, "versions", out var versions) && versions.GetArrayLength() > 0)
            {
                var latest = versions[0];
                version = GetString(latest, "version");
                sourceUrl = FindNamedValue(latest, "properties", "key",
                    "Microsoft.VisualStudio.Services.Links.Source", "value");
                iconUrl = FindNamedValue(latest, "files", "assetType",
                    "Microsoft.VisualStudio.Services.Icons.Small", "source");
            }

            packages.Add(new PackageInfo
            {
                Id = $"{authorId}/{packageName}",
                CurrentVersion = version,
                Description = GetString(extension, "shortDescription"),
                AuthorInfo = GetNestedString(extension, "publisher", "displayName"),
                RepositoryUrl = sourceUrl,
                PackageUrl = string.Format(VsCodeLinkTemplate, authorId, packageName),
                Tags = GetStringArray(extension, "tags"),
                OtherVersions = [version],
                IconUrl = iconUrl,
                DownloadsCount = FindNamedInt64(extension, "statistics", "statisticName", "install", "value")
            });
        }
        return packages;
    }

    public IReadOnlyList<string> ConvertNpmJsonToSuggestionsList(JsonDocument json)
    {
        if (!TryGetArray(json.RootElement, "objects", out var objects)) return [];
        var result = new List<string>(objects.GetArrayLength());
        foreach (var item in objects.EnumerateArray())
        {
            string name = GetNestedString(item, "package", "name");
            if (name.Length != 0) result.Add(name);
        }
        return result;
    }

    public IReadOnlyList<string> ConvertNugetJsonToSuggestionsList(JsonDocument json) =>
        GetStringArray(json.RootElement, "data");

    public IReadOnlyList<PackageVersion> ConvertNpmJsonToPackageVersions(JsonDocument content, int maxVersionsCount)
    {
        if (maxVersionsCount <= 0 || !content.RootElement.TryGetProperty("time", out var time) ||
            time.ValueKind != JsonValueKind.Object) return [];

        var newest = new PriorityQueue<PackageVersion, DateTime>();
        foreach (var entry in time.EnumerateObject())
        {
            if (entry.Name is "created" or "modified" || !entry.Value.TryGetDateTime(out var published)) continue;
            newest.Enqueue(new PackageVersion(entry.Name, published), published);
            if (newest.Count > maxVersionsCount) newest.Dequeue();
        }
        return newest.UnorderedItems.Select(item => item.Element)
            .OrderByDescending(version => version.ReleaseDate).ToArray();
    }

    public IReadOnlyList<PackageVersion> ConvertNugetJsonToPackageVersions(
        JsonDocument content, int maxVersionsCount, out List<string?> pagesRefs)
    {
        pagesRefs = [];
        if (!TryGetArray(content.RootElement, "items", out var pages)) return [];

        var versions = new List<PackageVersion>();
        foreach (var page in pages.EnumerateArray())
        {
            if (TryGetArray(page, "items", out var pageItems)) AddNugetVersions(pageItems, versions);
            else if (page.TryGetProperty("catalogEntry", out var catalogEntry)) AddNugetVersion(catalogEntry, versions);
            else if (GetNullableString(page, "@id") is { } pageReference) pagesRefs.Add(pageReference);
        }
        return versions.OrderByDescending(version => version.ReleaseDate)
            .Take(Math.Max(0, maxVersionsCount)).ToArray();
    }

    public IReadOnlyList<PackageVersion> ConvertVsCodeJsonToPackageVersions(
        JsonDocument content, int maxVersionsCount)
    {
        if (maxVersionsCount <= 0 || !TryGetFirstVsCodeExtensions(content.RootElement, out var extensions) ||
            extensions.GetArrayLength() == 0 || !TryGetArray(extensions[0], "versions", out var versions)) return [];

        var result = new List<PackageVersion>(Math.Min(versions.GetArrayLength(), maxVersionsCount));
        var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        foreach (var item in versions.EnumerateArray())
        {
            string version = GetString(item, "version");
            if (version.Length == 0 || !seen.Add(version)) continue;
            DateTime published = item.TryGetProperty("lastUpdated", out var updated) &&
                                 updated.TryGetDateTime(out var parsed) ? parsed : DateTime.MinValue;
            result.Add(new PackageVersion(version, published));
        }
        return result.OrderByDescending(version => version.ReleaseDate).Take(maxVersionsCount).ToArray();
    }

    private static void AddNugetVersions(JsonElement items, List<PackageVersion> versions)
    {
        foreach (var item in items.EnumerateArray())
            if (item.TryGetProperty("catalogEntry", out var entry)) AddNugetVersion(entry, versions);
    }

    private static void AddNugetVersion(JsonElement entry, List<PackageVersion> versions)
    {
        string version = GetString(entry, "version");
        DateTime? published = entry.TryGetProperty("published", out var date) && date.TryGetDateTime(out var parsed)
            ? parsed : null;
        if (version.Length != 0) versions.Add(new PackageVersion(version, published));
    }

    private static string GetNpmAuthors(JsonElement package)
    {
        if (TryGetArray(package, "maintainers", out var maintainers))
            return string.Join(",", maintainers.EnumerateArray().Select(x => GetString(x, "username"))
                .Where(x => x.Length != 0));
        return GetNestedString(package, "publisher", "username");
    }

    private static bool TryGetFirstVsCodeExtensions(JsonElement root, out JsonElement extensions)
    {
        extensions = default;
        return TryGetArray(root, "results", out var results) && results.GetArrayLength() > 0 &&
               TryGetArray(results[0], "extensions", out extensions);
    }

    private static bool TryGetArray(JsonElement element, string name, out JsonElement array)
    {
        array = default;
        return element.ValueKind == JsonValueKind.Object && element.TryGetProperty(name, out array) &&
               array.ValueKind == JsonValueKind.Array;
    }

    private static string GetString(JsonElement element, string name) => GetNullableString(element, name) ?? "";
    private static string? GetNullableString(JsonElement element, string name) =>
        element.ValueKind == JsonValueKind.Object && element.TryGetProperty(name, out var value) &&
        value.ValueKind == JsonValueKind.String ? value.GetString() : null;
    private static string GetNestedString(JsonElement element, string objectName, string name) =>
        element.ValueKind == JsonValueKind.Object && element.TryGetProperty(objectName, out var nested)
            ? GetString(nested, name) : "";
    private static long GetInt64(JsonElement element, string name) =>
        element.ValueKind == JsonValueKind.Object && element.TryGetProperty(name, out var value) &&
        value.TryGetInt64(out long result) ? result : 0;
    private static long GetNestedInt64(JsonElement element, string objectName, string name) =>
        element.ValueKind == JsonValueKind.Object && element.TryGetProperty(objectName, out var nested)
            ? GetInt64(nested, name) : 0;

    private static IReadOnlyList<string> GetStringArray(JsonElement element, string name)
    {
        if (!TryGetArray(element, name, out var values)) return [];
        var result = new List<string>(values.GetArrayLength());
        foreach (var value in values.EnumerateArray())
            if (value.ValueKind == JsonValueKind.String && value.GetString() is { } text) result.Add(text);
        return result;
    }

    private static IReadOnlyList<string> GetObjectStringArray(JsonElement element, string arrayName, string name)
    {
        if (!TryGetArray(element, arrayName, out var values)) return [];
        var result = new List<string>(values.GetArrayLength());
        foreach (var value in values.EnumerateArray())
        {
            string text = GetString(value, name);
            if (text.Length != 0) result.Add(text);
        }
        return result;
    }

    private static string GetFirstString(JsonElement element, string name)
    {
        if (!TryGetArray(element, name, out var values)) return "";
        foreach (var value in values.EnumerateArray())
            if (value.ValueKind == JsonValueKind.String) return value.GetString() ?? "";
        return "";
    }

    private static string FindNamedValue(JsonElement element, string arrayName, string nameProperty,
        string expectedName, string valueProperty)
    {
        if (!TryGetArray(element, arrayName, out var items)) return "";
        foreach (var item in items.EnumerateArray())
            if (string.Equals(GetString(item, nameProperty), expectedName, StringComparison.Ordinal))
                return GetString(item, valueProperty);
        return "";
    }

    private static long FindNamedInt64(JsonElement element, string arrayName, string nameProperty,
        string expectedName, string valueProperty)
    {
        if (!TryGetArray(element, arrayName, out var items)) return 0;
        foreach (var item in items.EnumerateArray())
            if (string.Equals(GetString(item, nameProperty), expectedName, StringComparison.Ordinal))
                return GetInt64(item, valueProperty);
        return 0;
    }
}
