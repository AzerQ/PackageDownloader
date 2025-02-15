using PackageDownloader.Core.Models;
using PackageDownloader.Infrastructure.Extensions;
using PackageDownloader.Infrastructure.Services.Abstractions;
using System.Text.Json;

namespace PackageDownloader.Infrastructure.Services.Implementations
{
    public class PackageInfoConverterService : IPackageInfoConverterService
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
            
            PackageInfo pacakgeInfo = new()
            {
                Id = element.GetProperty("name").GetStringOrDefault(),
                CurrentVersion = element.GetProperty("version").GetStringOrDefault(),
                Description = element.GetProperty("description").GetStringOrDefault(),
                AuthorInfo = authors,
                RepositoryUrl = repositoryUrl,
                PackageUrl = npmUrl,
                Tags = element.GetStrings(arrayFieldName: "keywords"),
                OtherVersions = [],
                DownloadsCount = element.GetJsonElement("downloads.monthly").GetInt64()
            };

            return pacakgeInfo;
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
            
            PackageInfo pacakgeInfo = new()
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

            return pacakgeInfo;
        }

        private IEnumerable<T> ConvertModelFromJson<T>(JsonDocument data, Func<JsonElement, T> converter, string? arrayPropertyName = default)
        {
            var rootElements = arrayPropertyName != default ?
                  data.RootElement.GetProperty(arrayPropertyName).EnumerateArray()
                : data.RootElement.EnumerateArray();

            foreach (var element in rootElements)
            {
                yield return converter(element);
            }
        }

        public IEnumerable<PackageInfo> ConvertNpmJsonToPackageInfo(JsonDocument json)
        {
            return ConvertModelFromJson(json, NpmConverter);
        }

        public IEnumerable<PackageInfo> ConvertNugetJsonToPackageInfo(JsonDocument json)
        {
            return ConvertModelFromJson(json, NugetConverter, arrayPropertyName: "data");
        }

        public IEnumerable<string> ConvertNpmJsonToSuggestionsList(JsonDocument json) =>
           json.RootElement.GetStrings(itemField: "name");

        public IEnumerable<string> ConvertNugetJsonToSuggestionsList(JsonDocument json) =>
           json.RootElement.GetStrings(arrayFieldName: "data");

    }
}
