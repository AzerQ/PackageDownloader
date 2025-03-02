using System.Text.Json;
using PackageDownloader.Infrastructure.Services.Abstractions;

namespace PackageDownloader.Infrastructure.Extensions;

public static class JsonPathExecutorExtensions
{
    public static string? GetString(this IJsonPathExecutor jPath, JsonElement rootElement, string jsonPath) =>
    jPath.GetSingleNode(rootElement, jsonPath)?.GetString();
    
    public static bool? GetBool(this IJsonPathExecutor jPath, JsonElement rootElement, string jsonPath) =>
        jPath.GetSingleNode(rootElement, jsonPath)?.GetBoolean();

    public static double? GetDouble(this IJsonPathExecutor jPath, JsonElement rootElement, string jsonPath) =>
        jPath.GetSingleNode(rootElement, jsonPath)?.GetDouble();
    
    public static long? GetLong(this IJsonPathExecutor jPath, JsonElement rootElement, string jsonPath) =>
        jPath.GetSingleNode(rootElement, jsonPath)?.GetInt64();
    
    public static int? GetInt(this IJsonPathExecutor jPath, JsonElement rootElement, string jsonPath) =>
        jPath.GetSingleNode(rootElement, jsonPath)?.GetInt32();
    
    public static DateTime? GetDateTime(this IJsonPathExecutor jPath, JsonElement rootElement, string jsonPath) =>
        jPath.GetSingleNode(rootElement, jsonPath)?.GetDateTime();

    public static Guid? GetGuid(this IJsonPathExecutor jPath, JsonElement rootElement, string jsonPath) =>
        jPath.GetSingleNode(rootElement, jsonPath)?.GetGuid();

}