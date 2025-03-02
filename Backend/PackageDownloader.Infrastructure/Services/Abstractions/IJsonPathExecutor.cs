using System.Text.Json;

namespace PackageDownloader.Infrastructure.Services.Abstractions;

public interface IJsonPathExecutor
{
    IEnumerable<JsonElement> GetAllNodes(JsonElement rootElement, string jsonPath);
    
    JsonElement? GetSingleNode(JsonElement rootElement, string jsonPath);
    
}