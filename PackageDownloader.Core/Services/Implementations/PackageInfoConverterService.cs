using PackageDownloader.Core.Extensions;
using PackageDownloader.Core.Models;
using PackageDownloader.Core.Services.Abstractions;
using System.Text.Json;

namespace PackageDownloader.Core.Services.Implementations
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

        private IEnumerable<T> ConvertModelFromJson<T>(string json, Func<JsonElement, T> converter, string? arrayProprtyName = default)
        {
            JsonDocument data = JsonDocument.Parse(json);
            var rootElements = (arrayProprtyName != default) ? 
                  data.RootElement.GetProperty(arrayProprtyName).EnumerateArray()
                : data.RootElement.EnumerateArray();

            foreach (var element in rootElements)
            {
                yield return converter(element);
            }
        }

        public IEnumerable<PackageInfo> ConvertNpmJsonStringToPackageInfo(string json)
        {
           return ConvertModelFromJson<PackageInfo>(json, NpmConverter);   
        }

        public IEnumerable<PackageInfo> ConvertNugetJsonStringToPackageInfo(string json)
        {
            return ConvertModelFromJson<PackageInfo>(json, NugetConverter, arrayProprtyName: "data");
        }
    }
}
