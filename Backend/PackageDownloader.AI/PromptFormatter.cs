using PackageDownloader.AI.PromptTemplates.Models;
using Stubble.Core.Builders;
using System.Collections.Concurrent;
using System.Reflection;

namespace PackageDownloader.AI
{
    public static class PromptFormatter
    {

        private static ConcurrentDictionary<string, string> _templatesCache = [];

        private static string GetPromptTemplate(string templateFileName)
        {
           return _templatesCache.GetOrAdd(templateFileName, key =>
            {
                string? appDirectory = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location);

                if (appDirectory == null)
                    throw new ArgumentNullException(nameof(appDirectory));

                string templateFullPath = Path.Combine(appDirectory, "PromptTemplates", templateFileName);

                return File.ReadAllText(templateFullPath);
            });
            
        }

        public static string FormatPackageRecommendationsPrompt(PackageRecommendationsPrompt packageRecommendationsPrompt)
        {
            var renderer = new StubbleBuilder().Build();
            return renderer.Render(GetPromptTemplate("PackageRecommendations.mustache"), packageRecommendationsPrompt);
        }
    }
}
