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
            var authorElement = element.GetJsonElement("author.name");
            var repositroryElement = element.GetJsonElement("links.repository");

            PackageInfo pacakgeInfo = new()
            {
                Id = element.GetProperty("name").GetStringOrDefault(),
                CurrentVersion = element.GetProperty("version").GetStringOrDefault(),
                Description = element.GetProperty("description").GetStringOrDefault(),
                AuthorInfo = authorElement.GetStringOrDefault(),
                RepositoryUrl = repositroryElement.GetStringOrDefault(),
                Tags = element.GetStrings(arrayFieldName: "keywords"),
                OtherVersions = []
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


            PackageInfo pacakgeInfo = new()
            {
                Id = element.GetProperty("id").GetStringOrDefault(),
                CurrentVersion = element.GetProperty("version").GetStringOrDefault(),
                Description = element.GetProperty("description").GetStringOrDefault(),
                AuthorInfo = author,
                RepositoryUrl = hasProjectUrl ? projectUrl.GetStringOrDefault() : "",
                Tags = element.GetStrings(arrayFieldName: "tags"),
                OtherVersions = element.GetStrings(arrayFieldName: "versions", itemField: "version")
            };

            return pacakgeInfo;
        }

        private IEnumerable<T> ConvertModelFromJson<T>(JsonDocument data, Func<JsonElement, T> converter, string? arrayProprtyName = default)
        {
            var rootElements = arrayProprtyName != default ?
                  data.RootElement.GetProperty(arrayProprtyName).EnumerateArray()
                : data.RootElement.EnumerateArray();

            foreach (var element in rootElements)
            {
                yield return converter(element);
            }
        }

        public IEnumerable<PackageInfo> ConvertNpmJsonStringToPackageInfo(JsonDocument json)
        {
            return ConvertModelFromJson(json, NpmConverter);
        }

        public IEnumerable<PackageInfo> ConvertNugetJsonStringToPackageInfo(JsonDocument json)
        {
            return ConvertModelFromJson(json, NugetConverter, arrayProprtyName: "data");
        }
    }
}
