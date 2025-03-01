namespace PackageDownloader.AI.Models;

public class ChatCompletionResponse
{
    public required string Id { get; set; }
    public required string Provider { get; set; }
    public required string Model { get; set; }
    public required string Object { get; set; }
    public long Created { get; set; }
    public required Choice[] Choices { get; set; }
    public Usage? Usage { get; set; }
}