using System.Text;
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
            MaxConnectionsPerServer = MaxConnectionsPerServer
        };
        
        private static readonly HttpClient HttpClient = new(SocketsHandler);

        
        public static async Task<JsonDocument> GetJsonContentAsync(this Uri url)
        {
           
            var response = await HttpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();
            string serverResponse = await response.Content.ReadAsStringAsync();
            return JsonDocument.Parse(serverResponse);
        }

        public static async Task SaveFileAsync(this Uri url, string fileSavePath)
        {
            await using var responseStream = await HttpClient.GetStreamAsync(url);
            await using var fileStream = new FileStream(fileSavePath, FileMode.OpenOrCreate);
            await responseStream.CopyToAsync(fileStream);
        }
        
        public static async Task<JsonDocument> PostJsonDataAsync<TRequest>(this Uri url, TRequest requestData, Dictionary<string, string>? customHeaders = null)
        {
           
            string requestBody = JsonSerializer.Serialize(requestData);

            HttpRequestMessage httpRequestMessage = new()
            {
                RequestUri = url,
                Method = HttpMethod.Post,
                Content = new StringContent(requestBody, Encoding.UTF8, "application/json")
            };

            if (customHeaders != null)
            {
                foreach (var (key, value) in customHeaders)
                {
                    httpRequestMessage.Headers.Add(key, value);
                }
            }


            var response = await HttpClient.SendAsync(httpRequestMessage);
            response.EnsureSuccessStatusCode();
            string serverResponse = await response.Content.ReadAsStringAsync();
            return JsonDocument.Parse(serverResponse);
        }
        
    }
}
