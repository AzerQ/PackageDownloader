using System.Net;
using System.Net.Http.Json;
using System.Text.Json;

namespace PackageDownloader.Infrastructure.Extensions
{
    public static class UrlExtensions
    {
        private const int PooledConnectionLifetimeMin = 6;
        private const int PooledConnectionIdleTimeoutMin = 3;
        private const int MaxConnectionsPerServer = 6_000;
        
        private static readonly SocketsHttpHandler SocketsHandler = new()
        {
            PooledConnectionLifetime = TimeSpan.FromMinutes(PooledConnectionLifetimeMin),
            PooledConnectionIdleTimeout = TimeSpan.FromMinutes(PooledConnectionIdleTimeoutMin),
            MaxConnectionsPerServer = MaxConnectionsPerServer,
            AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate
        };
        
        private static readonly HttpClient HttpClient = CreateHttpClient();

        private static HttpClient CreateHttpClient()
        {
            var client = new HttpClient(SocketsHandler);
            client.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
            client.DefaultRequestHeaders.Add("Accept", "application/json, text/plain, */*");
            client.DefaultRequestHeaders.Add("Accept-Language", "en-US,en;q=0.9");
            return client;
        }

        
        public static async Task<JsonDocument> GetJsonContentAsync(this Uri url)
        {
           
            using var response = await HttpClient.GetAsync(url, HttpCompletionOption.ResponseHeadersRead);
            response.EnsureSuccessStatusCode();
            await using var responseStream = await response.Content.ReadAsStreamAsync();
            return await JsonDocument.ParseAsync(responseStream);
        }

        public static async Task SaveFileAsync(this Uri url, string fileSavePath)
        {
            await using var responseStream = await HttpClient.GetStreamAsync(url);
            await using var fileStream = new FileStream(fileSavePath, FileMode.OpenOrCreate);
            await responseStream.CopyToAsync(fileStream);
        }
        
        public static async Task<JsonDocument> PostJsonDataAsync<TRequest>(this Uri url, TRequest requestData, Dictionary<string, string>? customHeaders = null)
        {
           
            using HttpRequestMessage httpRequestMessage = new()
            {
                RequestUri = url,
                Method = HttpMethod.Post,
                Content = JsonContent.Create(requestData)
            };

            if (customHeaders != null)
            {
                foreach (var (key, value) in customHeaders)
                {
                    httpRequestMessage.Headers.Add(key, value);
                }
            }


            using var response = await HttpClient.SendAsync(
                httpRequestMessage,
                HttpCompletionOption.ResponseHeadersRead);
            response.EnsureSuccessStatusCode();
            await using var responseStream = await response.Content.ReadAsStreamAsync();
            return await JsonDocument.ParseAsync(responseStream);
        }
        
    }
}
