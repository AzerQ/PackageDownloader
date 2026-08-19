using System.Net.Http.Json;
using System.Text.Json;
using PackageDownloader.AI.Models;

namespace PackageDownloader.AI;

public partial class OpenRouterClient
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly string _modelName;

    public OpenRouterClient(string apiUrl, string apiKey, string modelName)
    {
        _apiKey = apiKey ?? throw new ArgumentNullException(nameof(apiKey));
        _modelName = modelName ?? throw new ArgumentNullException(nameof(modelName));
        _httpClient = new HttpClient
        {
            BaseAddress = new Uri(apiUrl)
        };
        _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_apiKey}");
    }

    public async Task<ChatCompletionResponse?> GetChatCompletionAsync(string userMessage)
    {
        if (string.IsNullOrWhiteSpace(userMessage))
            throw new ArgumentException("User message cannot be null or empty.", nameof(userMessage));

        var request = new
        {
            model = _modelName,
            messages = new[]
            {
                new
                {
                    role = "user",
                    content = userMessage
                }
            }
        };

        using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "chat/completions")
        {
            Content = JsonContent.Create(request, options: JsonOptions)
        };
        using var response = await _httpClient.SendAsync(
            httpRequest,
            HttpCompletionOption.ResponseHeadersRead);

        response.EnsureSuccessStatusCode();

        await using var responseStream = await response.Content.ReadAsStreamAsync();
        return await JsonSerializer.DeserializeAsync<ChatCompletionResponse>(responseStream, JsonOptions);
    }
}
