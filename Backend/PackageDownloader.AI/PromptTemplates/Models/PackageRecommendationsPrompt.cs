namespace PackageDownloader.AI.PromptTemplates.Models
{
    public class PackageRecommendationsPrompt
    {
        public required string PackageType { get; set; }
        public required string UserPrompt { get; set; }
        public required string LangCode { get; set; }
        public required string ClassSchemeDescription { get; set; }
        public int MinRecommendationsCount { get; set; } = 5;
    }
}
