using System.Text.Json;

namespace PackageDownloader.Infrastructure.Extensions
{
    public static class UrlExtensions
    {
        public static async Task<JsonDocument> GetJsonContent(this Uri url)
        {
            using var httpClient = new HttpClient();
            var response = await httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();
            string serverResponse = await response.Content.ReadAsStringAsync();
            return JsonDocument.Parse(serverResponse);
        }
    }
}
