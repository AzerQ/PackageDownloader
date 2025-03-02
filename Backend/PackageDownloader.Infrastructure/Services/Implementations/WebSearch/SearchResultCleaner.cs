namespace PackageDownloader.Infrastructure.Services.Implementations.WebSearch;

public class SearchResultCleaner
{
    public string CleanSearchResult(string searchResult, string prePrompt)
    {
        var prePromptWordsArray = prePrompt.ToLower().Split(' ');
        var searchResultWordsArray = searchResult.ToLower().Split(' ');
        
        var clearedResultWords = searchResultWordsArray
            .Where(word => !prePromptWordsArray
                .Any(word.Contains));

        var resultWords = clearedResultWords.ToList();
        return  resultWords.Count != 0 ?
             resultWords
            .Aggregate((current, next) => current + " " + next)
            .Trim() : "";
        
    }
}