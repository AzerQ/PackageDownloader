namespace PackageDownloader.AI.Models;


public class Choice
{
    public object Logprobs { get; set; }
    public string FinishReason { get; set; }
    public string NativeFinishReason { get; set; }
    public int Index { get; set; }
    public Message Message { get; set; }
}
