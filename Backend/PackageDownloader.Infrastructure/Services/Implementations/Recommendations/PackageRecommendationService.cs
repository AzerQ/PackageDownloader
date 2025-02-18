using PackageDownloader.AI;
using PackageDownloader.AI.Models;
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
        public async Task<IEnumerable<PackageRecommendation>?> GetRecommendations(PackageType packageType, string userPrompt)
        {
            ChatCompletionResponse? serverResponse =
                await _openRouterClient.GetChatCompletionAsync(PreparePrompt(packageType, userPrompt));

            if (serverResponse == null)
                throw new NullReferenceException("Не удалось получить корректнй ответ от модели AI");

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

        private string PreparePrompt(PackageType packageType, string userPrompt)
        {
            var result = new StringBuilder();
            result.AppendFormat("Пользователь хочет получить рекомендации по пакетам для системы {0}.", packageType);
            result.AppendFormat("Он задал следующий вопрос: {0}.", userPrompt);
            result.AppendFormat("Пожалуйста, ответь в формате голого Json, содержащий следующие поля (Тип поля - имя поля, язык C#): {0}."
                , GetClassSchemeDescription(typeof(PackageRecommendation)));
            result.AppendFormat("Дай на выходе не менее 5-6 актуальных и популярных пакетов, которые подходят под заданный запрос.");
            return result.ToString();
        }

        private string ClearAiResponse(string aiResponse)
        {
            return aiResponse
                .Replace("```json", "")
                .Replace("```", "");
        }


    }
}
