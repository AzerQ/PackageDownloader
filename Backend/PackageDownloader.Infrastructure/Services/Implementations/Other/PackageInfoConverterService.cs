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
            // Обрабатываем новый формат от NPM Registry API
            // Структура: {"package": {...}, "downloads": {...}, ...}
            var packageElement = element.TryGetProperty("package", out var pkg) ? pkg : element;

            var repositoryUrl = "";
            if (packageElement.TryGetProperty("links", out var links) && links.TryGetProperty("repository", out var repo))
            {
                repositoryUrl = repo.GetStringOrDefault();
                repositoryUrl = repositoryUrl.StartsWith("git+") 
                    ? repositoryUrl.Substring(4, repositoryUrl.Length - 4) 
                    : repositoryUrl;
            }
             
            var npmUrl = "";
            if (packageElement.TryGetProperty("links", out var linksForNpm) && linksForNpm.TryGetProperty("npm", out var npmLink))
            {
                npmUrl = npmLink.GetStringOrDefault();
            }
            else
            {
                var name = packageElement.GetProperty("name").GetStringOrDefault();
                npmUrl = $"https://www.npmjs.com/package/{name}";
            }
            
            string authors = "";
            if (packageElement.TryGetProperty("maintainers", out var maintainers))
            {
                authors = string.Join(",", maintainers.EnumerateArray().Select(m => 
                    m.TryGetProperty("username", out var username) ? username.GetString() ?? "" : ""));
            }
            else if (packageElement.TryGetProperty("publisher", out var publisher) && 
                     publisher.TryGetProperty("username", out var publisherUsername))
            {
                authors = publisherUsername.GetStringOrDefault();
            }
            
            string packageLastVersion = packageElement.GetProperty("version").GetStringOrDefault();
            
            long downloadsCount = 0;
            if (element.TryGetProperty("downloads", out var downloads) && downloads.TryGetProperty("monthly", out var monthly))
            {
                downloadsCount = monthly.GetInt64();
            }
            
            PackageInfo packageInfo = new()
            {
                Id = packageElement.GetProperty("name").GetStringOrDefault(),
                CurrentVersion = packageLastVersion,
                Description = packageElement.GetProperty("description").GetStringOrDefault(),
                AuthorInfo = authors,
                RepositoryUrl = repositoryUrl,
                PackageUrl = npmUrl,
                Tags = packageElement.TryGetProperty("keywords", out var keywords) ? keywords.GetStrings() : [],
                OtherVersions = [packageLastVersion],
                DownloadsCount = downloadsCount
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
            // NPM Registry API возвращает: {"objects": [{"package": {...}, "downloads": {...}}, ...]}
            return ConvertModelFromJson(json, NpmConverter, arrayJsonPath: "$.objects");
        }

        public IEnumerable<PackageInfo> ConvertVsCodeJsonToPackageInfo(JsonDocument json)
        {
            return ConvertModelFromJson(json, VsCodeConverter, arrayJsonPath: "$.results[0].extensions");
        }

        public IEnumerable<PackageInfo> ConvertNugetJsonToPackageInfo(JsonDocument json)
        {
            return ConvertModelFromJson(json, NugetConverter, arrayJsonPath: "$.data");
        }

        public IEnumerable<string> ConvertNpmJsonToSuggestionsList(JsonDocument json)
        {
            // NPM Registry API возвращает: {"objects": [{"package": {"name": "..."}, ...}, ...]}
            var objects = jPath.GetAllNodes(json.RootElement, "$.objects");
            return objects.Select(obj => 
            {
                if (obj.TryGetProperty("package", out var package) && 
                    package.TryGetProperty("name", out var name))
                {
                    return name.GetString() ?? "";
                }
                return "";
            }).Where(name => !string.IsNullOrEmpty(name));
        }

        public IEnumerable<string> ConvertNugetJsonToSuggestionsList(JsonDocument json) =>
           json.RootElement.GetStrings(arrayFieldName: "data");
        
    }
}
