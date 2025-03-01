using PackageDownloader.AI;
using PackageDownloader.AI.Models;
using PackageDownloader.AI.PromptTemplates.Models;
using PackageDownloader.Core.Models;
using PackageDownloader.Core.Services.Abstractions;
using System.Text;
using System.Text.Json;

namespace PackageDownloader.Infrastructure.Services.Implementations.Recommendations
{
    public class PackageRecommendationService : IPackageRecommendationService
    {
        private readonly OpenRouterClient _openRouterClient;

        public PackageRecommendationService(OpenRouterClient openRouterClient)
        {
            _openRouterClient = openRouterClient;
        }
        public async Task<IEnumerable<PackageRecommendation>?> GetRecommendations(PackageType packageType, string userPrompt, string langCode)
        {
            ChatCompletionResponse? serverResponse =
                await _openRouterClient.GetChatCompletionAsync(PreparePrompt(packageType, userPrompt, langCode));

            if (serverResponse == null)
                throw new NullReferenceException("Не удалось получить корректный ответ от модели AI");

            string chatResponse = ClearAiResponse(serverResponse.Choices[0].Message.Content);

            return JsonSerializer.Deserialize<IEnumerable<PackageRecommendation>>(chatResponse,
                 new JsonSerializerOptions
                 {
                     PropertyNameCaseInsensitive = true
                 });
        }


        private string GetClassSchemeDescription(Type classType)
        {
            return string.Join(Environment.NewLine, classType.GetProperties()
                .Select(prop => $"{prop.PropertyType} {prop.Name};"));
        }

        private string PreparePrompt(PackageType packageType, string userPrompt, string langCode)
        {
            PackageRecommendationsPrompt packageRecommendationsPrompt = new()
            {
                ClassSchemeDescription = GetClassSchemeDescription(typeof(PackageRecommendation)),
                LangCode = langCode,
                MinRecommendationsCount = 6,
                PackageType = packageType.ToString(),
                UserPrompt = userPrompt
            };
            
            return PromptFormatter.FormatPacakgeRecommendationsPrompt(packageRecommendationsPrompt);
        }

        private string ClearAiResponse(string aiResponse)
        {
            return aiResponse
                .Replace("```json", "")
                .Replace("```", "");
        }


    }
}
