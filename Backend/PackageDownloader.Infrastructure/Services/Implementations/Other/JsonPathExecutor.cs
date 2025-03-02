using System.Text.Json;
using JsonCons.JsonPath;
using PackageDownloader.Infrastructure.Services.Abstractions;

namespace PackageDownloader.Infrastructure.Services.Implementations.Other;

public class JsonPathExecutor : IJsonPathExecutor
{
    public IEnumerable<JsonElement> GetAllNodes(JsonElement rootElement, string jsonPath)
    {
      var result = JsonSelector.Select(rootElement, jsonPath);

      JsonElement? firstElement = result.FirstOrDefault();

      return firstElement switch
      {
         null => [],
         { ValueKind: JsonValueKind.Array } => firstElement.Value.EnumerateArray(),
         { ValueKind: JsonValueKind.Undefined} => [],
          _ => result
      };
      
    }


    public JsonElement? GetSingleNode(JsonElement rootElement, string jsonPath)
    {
       var result = GetAllNodes(rootElement, jsonPath).FirstOrDefault();
       return result.ValueKind != JsonValueKind.Undefined  ? result : null;
    }

}