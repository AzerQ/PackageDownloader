using PackageDownloader.Core.Models;

namespace PackageDownloader.Core.Services.Abstractions
{
    public abstract class PackageSearchServiceBase
    {
        protected async Task<string> GetStringFromUrl(string url)
        {
            using (var httpClient = new HttpClient())
            {
                var response = await httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadAsStringAsync();
            }
        }

       public abstract Task<IEnumerable<PackageInfo>> SearchPacakgesByName(string name);

    }
}
