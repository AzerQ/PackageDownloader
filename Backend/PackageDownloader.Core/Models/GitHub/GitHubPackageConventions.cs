namespace PackageDownloader.Core.Models.GitHub;

/// <summary>
/// Naming conventions shared between the API clients and the GitHub services:
/// how versions and artifact types of a GitHub package are encoded as plain strings.
/// </summary>
public static class GitHubPackageConventions
{
    /// <summary>
    /// Pseudo version that is always available for any repository:
    /// the whole default (main) branch packed into a source archive.
    /// </summary>
    public const string LatestSourceVersion = "latest.source";

    /// <summary>
    /// Suffix turning any release tag into "source code of that tag" version,
    /// e.g. <c>v1.2.3.source</c>.
    /// </summary>
    public const string SourceVersionSuffix = ".source";

    /// <summary>
    /// Artifact type meaning "source code archive" instead of the release assets.
    /// </summary>
    public const string SourceArtifactType = "source";

    /// <summary>
    /// Artifact type meaning "every asset of the release". Used when no artifact type is specified.
    /// </summary>
    public const string AllArtifactsType = "all";

    public static bool IsLatestSourceVersion(string? version) =>
        string.Equals(version, LatestSourceVersion, StringComparison.OrdinalIgnoreCase);

    public static bool IsSourceArtifactType(string? artifactType) =>
        string.Equals(artifactType, SourceArtifactType, StringComparison.OrdinalIgnoreCase);

    public static bool IsAllArtifactsType(string? artifactType) =>
        string.IsNullOrWhiteSpace(artifactType) ||
        string.Equals(artifactType, AllArtifactsType, StringComparison.OrdinalIgnoreCase);

    /// <summary>
    /// Resolves a version string into a release tag and a flag telling whether
    /// the source code archive (instead of the release assets) was requested.
    /// </summary>
    /// <param name="version">
    /// Version string, <see langword="null"/> for the latest release.
    /// </param>
    /// <returns>
    /// <c>releaseTag</c> is <see langword="null"/> when the default branch head is requested.
    /// </returns>
    public static (string? releaseTag, bool isSource) ParseVersion(string? version)
    {
        if (string.IsNullOrWhiteSpace(version))
            return (null, false);

        version = version.Trim();

        if (IsLatestSourceVersion(version))
            return (null, true);

        return version.EndsWith(SourceVersionSuffix, StringComparison.OrdinalIgnoreCase)
            ? (version[..^SourceVersionSuffix.Length], true)
            : (version, false);
    }
}
