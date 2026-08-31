using System.Text.Json;
using PackageDownloader.Infrastructure.Extensions;
using PackageDownloader.Infrastructure.Services.Abstractions;

namespace PackageDownloader.Infrastructure.Services.Implementations.WebSearch;

public class GoogleWebSearchService(SearchResultCleaner searchResultCleaner) : IGlobalWebSearchService
{
    private const string GoogleSearchUrlTemplate = "https://google.com/complete/search?client=chrome&q={0}";
    
    public async Task<IEnumerable<string>> GetSearchSuggestions(string userPrompt, string? prePrompt = null)
    {
        string finalPrompt = $"{prePrompt} {userPrompt}";
        Uri searchUri = new Uri(string.Format(GoogleSearchUrlTemplate, finalPrompt));

        using var content = await searchUri.GetJsonContentAsync();
        if (content.RootElement.ValueKind != JsonValueKind.Array || content.RootElement.GetArrayLength() < 2)
            return [];

        var suggestions = content.RootElement[1].GetStrings().ToArray();
        
        var clearSuggestions = string.IsNullOrEmpty(prePrompt)
            ? suggestions
            : suggestions.Select(searchResult => searchResultCleaner.CleanSearchResult(searchResult, prePrompt));

        return clearSuggestions.Distinct().ToArray();
    }
}
