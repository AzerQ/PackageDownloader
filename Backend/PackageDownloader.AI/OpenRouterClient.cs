using System.Text;
using System.Text.Json;
using PackageDownloader.AI.Models;

namespace PackageDownloader.AI;

public partial class OpenRouterClient
{
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

        var jsonContent = JsonSerializer.Serialize(request);
        var httpContent = new StringContent(jsonContent, Encoding.UTF8, "application/json");

        var response = await _httpClient.PostAsync("chat/completions", httpContent);

        response.EnsureSuccessStatusCode();

        var responseContent = await response.Content.ReadAsStringAsync();
        
        return JsonSerializer.Deserialize<ChatCompletionResponse>(responseContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
    }
}