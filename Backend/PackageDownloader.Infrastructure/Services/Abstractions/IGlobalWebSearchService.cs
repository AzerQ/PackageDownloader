namespace PackageDownloader.Infrastructure.Services.Abstractions;


public interface IGlobalWebSearchService
{
    public Task<IEnumerable<string>> GetSearchSuggestions(string userPrompt, string? prePrompt = null);
}