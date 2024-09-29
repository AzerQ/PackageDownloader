namespace PackageDownloader.Core.Models
{
    public class PackageInfo
    {
        public required string Id { get; set; }
        public required string CurrentVersion { get; set; }
        public IEnumerable<string>? OtherVersions { get; set; }
        public required string Description { get; set; }
        public required IEnumerable<string> Tags { get; set; }
        public required string AuthorInfo { get; set; }
        public string? RepositoryUrl { get; set; }

    }
}
