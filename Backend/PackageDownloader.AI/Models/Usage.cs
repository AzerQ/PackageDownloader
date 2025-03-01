using System.Text.Json.Serialization;

namespace PackageDownloader.AI.Models;


public class Usage
{
    [JsonPropertyName("prompt_tokens")]
    public required int PromptTokens { get; set; }
    
    [JsonPropertyName("completion_tokens")]
    public required int CompletionTokens { get; set; }
    
    [JsonPropertyName("total_tokens")]
    public required int TotalTokens { get; set; }
    
}
