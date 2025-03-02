using System.Text.Json;
using JsonCons.JsonPath;
using PackageDownloader.Infrastructure.Extensions;
using PackageDownloader.Infrastructure.Services.Abstractions;

namespace PackageDownloader.Infrastructure.Services.Implementations.WebSearch;

public class GoogleWebSearchService(SearchResultCleaner searchResultCleaner) : IGlobalWebSearchService
{
    private const string GoogleSearchUrlTemplate = "https://google.com/complete/search?client=chrome&q={0}";
    private const string SuggestionsJsonPath = "$[1]";
    
    public async Task<IEnumerable<string>> GetSearchSuggestions(string userPrompt, string? prePrompt = null)
    {
        string finalPrompt = $"{prePrompt} {userPrompt}";
        Uri searchUri = new Uri(string.Format(GoogleSearchUrlTemplate, finalPrompt));

        var content = await searchUri.GetJsonContentAsync();
        JsonElement suggestionsElement = JsonSelector.Select(content.RootElement, SuggestionsJsonPath).First();
        
        var suggestions = suggestionsElement.GetStrings();
        
        var clearSuggestions = string.IsNullOrEmpty(prePrompt)
            ? suggestions
            : suggestions.Select(searchResult => searchResultCleaner.CleanSearchResult(searchResult, prePrompt));

        return clearSuggestions.Distinct();
    }
}