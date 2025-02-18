namespace PackageDownloader.AI.Models;


public class Message
{
    public string Role { get; set; }
    public string Content { get; set; }
    public object Refusal { get; set; }
}