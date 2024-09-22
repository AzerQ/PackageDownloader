namespace PackageDownloader.Core.Models
{
    public enum PackageType
    {
        Npm,
        Nuget
    }

    public class PackageRequest
    {
        public PackageType PackageType { get; set; }

        public required string PackageID { get;set; }

        public string? PackageVersion { get; set; }
    }
}
