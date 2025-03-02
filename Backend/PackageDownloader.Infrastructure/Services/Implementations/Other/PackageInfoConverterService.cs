using System.Text.Json;
using JsonCons.JsonPath;
using PackageDownloader.Core.Models;
using PackageDownloader.Infrastructure.Extensions;
using PackageDownloader.Infrastructure.Services.Abstractions;

namespace PackageDownloader.Infrastructure.Services.Implementations.Other
{
    public class PackageInfoConverterService (IJsonPathExecutor jPath) : IPackageInfoConverterService
    {
        private PackageInfo NpmConverter(JsonElement element)
        {

            var repositoryElement = element.GetJsonElement("links.repository");
            var repositoryUrl = repositoryElement.GetStringOrDefault();
            repositoryUrl = repositoryUrl.StartsWith("git+")
                ? repositoryUrl.Substring(4, repositoryUrl.Length - 4)
                : repositoryUrl;
             
            var npmUrl = element.GetJsonElement("links.npm").GetStringOrDefault();
            
            string authors = string.Join(",", element.GetStrings("maintainers", itemField: "username"));
            string packageLastVersion = element.GetProperty("version").GetStringOrDefault();
            
            PackageInfo packageInfo = new()
            {
                Id = element.GetProperty("name").GetStringOrDefault(),
                CurrentVersion = packageLastVersion,
                Description = element.GetProperty("description").GetStringOrDefault(),
                AuthorInfo = authors,
                RepositoryUrl = repositoryUrl,
                PackageUrl = npmUrl,
                Tags = element.GetStrings(arrayFieldName: "keywords"),
                OtherVersions = [packageLastVersion],
                DownloadsCount = element.GetJsonElement("downloads.monthly").GetInt64()
            };

            return packageInfo;
        }

        private PackageInfo NugetConverter(JsonElement element)
        {
            string author = element.GetProperty("authors")
                            .EnumerateArray()
                            .FirstOrDefault()
                            .GetStringOrDefault();

            bool hasProjectUrl = element.TryGetProperty("projectUrl", out var projectUrl);
            bool hasIconUrl = element.TryGetProperty("iconUrl", out var iconUrl);
            string packageId = element.GetProperty("id").GetStringOrDefault();
            
            PackageInfo packageInfo = new()
            {
                Id = packageId,
                CurrentVersion = element.GetProperty("version").GetStringOrDefault(),
                Description = element.GetProperty("description").GetStringOrDefault(),
                AuthorInfo = author,
                RepositoryUrl = hasProjectUrl ? projectUrl.GetStringOrDefault() : "",
                PackageUrl = $"https://www.nuget.org/packages/{packageId}",
                Tags = element.GetStrings(arrayFieldName: "tags"),
                OtherVersions = element.GetStrings(arrayFieldName: "versions", itemField: "version"),
                IconUrl = hasIconUrl ? iconUrl.GetStringOrDefault() : "",
                DownloadsCount = element.GetJsonElement("totalDownloads").GetInt64()
            };

            return packageInfo;
        }

        private readonly string _vsCodeLinkTemplate = "https://marketplace.visualstudio.com/items?itemName={0}.{1}";
        private PackageInfo VsCodeConverter(JsonElement element)
        {
            
            string authorName = jPath.GetString(element, "$.publisher.displayName") ?? "";
            string authorId = jPath.GetString(element, "$.publisher.publisherName") ?? "";

            string sourceRepoLink = jPath.GetString(element,
                "$.versions[0].properties[?(@.key=='Microsoft.VisualStudio.Services.Links.Source')].value") ?? "";
            
            string iconUrl = jPath.GetString(element,
                "$.versions[0].files[?(@.assetType=='Microsoft.VisualStudio.Services.Icons.Small')].source") ?? ""; 
            
            string packageName = jPath.GetString(element, "$.extensionName") ?? "";
            string packageId = $"{authorId}/{packageName}";
            
            string packageLastVersion =  jPath.GetString(element, "$.versions[0].version") ?? "";
            
            long downloadsCount = jPath.GetLong(element, "$.statistics[?(@.statisticName=='install')].value") ?? 0;

            string packageUrl = string.Format(_vsCodeLinkTemplate, authorId, packageName);

            string description = jPath.GetString(element, "$.shortDescription") ?? "";
            
            PackageInfo packageInfo = new()
            {
                Id = packageId,
                CurrentVersion = packageLastVersion,
                Description = description,
                AuthorInfo = authorName,
                RepositoryUrl = sourceRepoLink,
                PackageUrl = packageUrl,
                Tags = element.GetStrings(arrayFieldName: "tags"),
                OtherVersions = [packageLastVersion],
                IconUrl = iconUrl,
                DownloadsCount = downloadsCount
            };

            return packageInfo;
        }
        
        private IEnumerable<T> ConvertModelFromJson<T>(JsonDocument data, Func<JsonElement, T> converter, string? arrayJsonPath = default)
        {
            var rootElements = arrayJsonPath != default 
                ? jPath.GetAllNodes(data.RootElement, arrayJsonPath)
                : data.RootElement.EnumerateArray().ToList();

            return rootElements.Select(converter);
            
        }

        public IEnumerable<PackageInfo> ConvertNpmJsonToPackageInfo(JsonDocument json)
        {
            return ConvertModelFromJson(json, NpmConverter);
        }

        public IEnumerable<PackageInfo> ConvertVsCodeJsonToPackageInfo(JsonDocument json)
        {
            return ConvertModelFromJson(json, VsCodeConverter, arrayJsonPath: "$.results[0].extensions");
        }

        public IEnumerable<PackageInfo> ConvertNugetJsonToPackageInfo(JsonDocument json)
        {
            return ConvertModelFromJson(json, NugetConverter, arrayJsonPath: "$.data");
        }

        public IEnumerable<string> ConvertNpmJsonToSuggestionsList(JsonDocument json) =>
           json.RootElement.GetStrings(itemField: "name");

        public IEnumerable<string> ConvertNugetJsonToSuggestionsList(JsonDocument json) =>
           json.RootElement.GetStrings(arrayFieldName: "data");
        
    }
}
