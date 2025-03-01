using System.Text.Json.Serialization;

namespace PackageDownloader.AI.Models;


public class Choice
{
    public object? Logprobs { get; set; }
    
    [JsonPropertyName("finish_reason")]
    public required string FinishReason { get; set; }
    
    [JsonPropertyName("native_finish_reason")]
    public required string NativeFinishReason { get; set; }
    
    public int Index { get; set; }
    
    public required Message Message { get; set; }
}
