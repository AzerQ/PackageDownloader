namespace PackageDownloader.AI.Models;


public class Message
{
    public required string Role { get; set; }
    public required string Content { get; set; }
    public object? Refusal { get; set; }
}