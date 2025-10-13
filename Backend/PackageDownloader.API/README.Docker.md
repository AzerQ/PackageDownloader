# Docker Hub Integration

This document describes the Docker Hub integration added to the PackageDownloader application.

## Overview

The Docker integration allows users to:
- **Fast search** for Docker images on Docker Hub (< 1 second)
- Get detailed information about Docker images and their tags
- Download Docker images as tar.gz archives
- Use both specialized Docker endpoints and unified package management APIs

## Performance Optimization

### Fast Search Implementation

The search performance has been optimized to match Docker Hub website speed:

- **Unified Search** (`/api/Docker/packages/search`): Returns results in < 1 second by avoiding additional API calls during search
- **Detailed Info** (`/api/Docker/packages/details/{id}`): Fetches complete tag information when needed
- **Progressive Loading**: Users get immediate search results, then can load detailed information on demand

### Search Strategy

1. **Fast Search**: Only basic repository information (no tag fetching)
2. **On-Demand Details**: Tags and versions loaded when user selects specific package
3. **Separate Endpoints**: Different endpoints for speed vs. completeness

## Architecture

The implementation follows the existing unified architecture pattern:

### Core Layer (PackageDownloader.Core)
- **Models**: Docker-specific models in `Models/Docker/` folder
  - `DockerImageInfo`: Unified Docker image information
  - `DockerHubSearchResponse`: Docker Hub search API response
  - `DockerHubTagsResponse`: Docker Hub tags API response  
  - `DockerManifest`: Docker image manifest structure

### Infrastructure Layer (PackageDownloader.Infrastructure)
- **HTTP Client**: `IDockerHubHttpClient` and `DockerHubHttpClient`
  - Handles communication with Docker Hub API
  - Manages Docker Registry authentication
  - Downloads Docker image layers and manifests
- **Services**: 
  - `DockerPackageSearchService`: Implements `IPackageSearchService` for Docker
  - `DockerPackageDownloaderService`: Implements `IPackageDownloadService` for Docker

### API Layer (PackageDownloader.API)
- **Controller**: `DockerController` provides specialized Docker endpoints
- **Unified API**: Existing `PackageInfoController` and `PackagesController` work with Docker packages

## API Endpoints

### Specialized Docker Endpoints

#### Search Docker Images
```
GET /api/Docker/search?query={query}&page={page}&pageSize={pageSize}
```
Returns Docker Hub search results with repository information.

#### Get Image Tags
```
GET /api/Docker/tags/{repository}?page={page}&pageSize={pageSize}
```
Returns available tags for a Docker image repository.

#### Get Image Manifest
```
GET /api/Docker/manifest/{repository}/{tag}
```
Returns the Docker image manifest with layer information.

#### Unified Package Search
```
GET /api/Docker/packages/search?namePart={namePart}
```
Returns Docker packages using unified PackageInfo format.

#### Package Suggestions
```
GET /api/Docker/packages/suggestions?namePart={namePart}
```
Returns Docker package name suggestions.

#### Prepare Download
```
POST /api/Docker/packages/download/prepare
Content-Type: application/json

{
  "packageType": "Docker",
  "packagesDetails": [
    {
      "packageID": "nginx",
      "packageVersion": "alpine"
    }
  ]
}
```
Prepares Docker images for download and returns download URL.

#### Download Archive
```
GET /api/Docker/packages/download/{packagesArchiveId}
```
Downloads the prepared Docker images archive.

### Unified API Endpoints

The existing unified endpoints also work with Docker packages:

```
GET /api/PackageInfo/GetSearchResults?packageType=Docker&namePart={namePart}
GET /api/PackageInfo/GetSearchSuggestions?packageType=Docker&namePart={namePart}
POST /api/Packages/PreparePackagesDownloadLink (with packageType: "Docker")
GET /api/Packages/GetPackagesAsArchive?packagesArchiveId={id}
```

## Docker Image Download Process

1. **Search**: Find Docker images using search endpoints
2. **Select**: Choose specific images and tags
3. **Prepare**: Submit download request with image details
4. **Download**: Get complete Docker images as tar.gz archives

### Docker Image Download

The service downloads complete Docker images including:
- **Image Configuration**: Complete image config JSON
- **All Layers**: Every layer of the Docker image as tar.gz
- **Manifest**: Docker manifest.json for image structure
- **Repositories**: Repository metadata file

The downloaded tar.gz archive is fully compatible with Docker and can be loaded using:
```bash
docker load -i image_name_tag.tar.gz
```

### Important Notes

- **Large Files**: Docker images can be several GB in size
- **Download Time**: Depends on image size and network speed
- **Multi-Architecture**: Service automatically selects linux/amd64 platform
- **Format**: Standard Docker tar.gz format (System.Formats.Tar)

### How Images Are Downloaded

1. Fetch manifest list (for multi-platform images)
2. Select appropriate platform (linux/amd64 preferred)
3. Download image config blob
4. Download all layer blobs sequentially
5. Create Docker-compatible tar.gz archive
6. Clean up temporary files

## Docker Hub Authentication

The service handles Docker Hub authentication automatically:
- Uses anonymous access for public repositories
- Obtains bearer tokens for Docker Registry API access
- Handles official vs. user repositories (library/ namespace)

## Configuration

No additional configuration is required. The service uses:
- Docker Hub API: `https://hub.docker.com/v2/`
- Docker Registry: `https://registry-1.docker.io/v2/`

## Error Handling

The service handles common Docker Hub scenarios:
- Rate limiting
- Repository not found
- Authentication failures
- Network timeouts
- Invalid image names/tags

## Docker Container Compatibility

The implementation is designed to work within Docker containers:
- Uses standard HTTP client patterns
- No external dependencies beyond .NET runtime
- Proper cleanup of temporary files
- Respects container resource limits

## Example Usage

### Search for Images
```bash
curl "https://localhost:7104/api/Docker/search?query=nginx&pageSize=5"
```

### Get Image Tags  
```bash
curl "https://localhost:7104/api/Docker/tags/nginx?pageSize=10"
```

### Download Images
```bash
# 1. Prepare download
curl -X POST "https://localhost:7104/api/Docker/packages/download/prepare" \
  -H "Content-Type: application/json" \
  -d '{
    "packageType": "Docker",
    "packagesDetails": [
      {
        "packageID": "nginx",
        "packageVersion": "alpine"
      }
    ]
  }'

# 2. Download using returned URL
curl -O "https://localhost:7104/api/Docker/packages/download/{archiveId}"
```

## Testing

Use the provided `Docker.http` file in the API project to test all endpoints during development.