using System.Text.Json;
using System.Xml.Linq;

namespace PackageDownloader.Core.Extensions
{
    public static class JsonElementExtension
    {
        public static bool HasValue(this JsonElement jsonElement)
        {
            return jsonElement.ValueKind != JsonValueKind.Undefined;
        }

        public static string GetStringOrDefault(this JsonElement jsonElement, string defaultValue = "")
        {
            return jsonElement.HasValue() ? jsonElement.GetString() ?? defaultValue : defaultValue;
        }

        public static IEnumerable<string> GetStrings(this JsonElement jsonElement, string arrayFieldName, string? itemField = default)
        {
            bool valuesExists = jsonElement.TryGetProperty(arrayFieldName, out var values);
            IEnumerable<string> stringValues = valuesExists ?
                values.EnumerateArray().Select(val =>
                {
                    return (itemField == default) ? val.GetStringOrDefault()
                    : val.GetProperty(itemField).GetStringOrDefault();
                })
                : [];

            return stringValues;
        }

        public static JsonElement GetJsonElement(this JsonElement jsonElement, string path)
        {
            if (jsonElement.ValueKind == JsonValueKind.Null ||
                jsonElement.ValueKind == JsonValueKind.Undefined)
            {
                return default;
            }

            string[] segments =
                path.Split(new[] { '.' }, StringSplitOptions.RemoveEmptyEntries);

            for (int n = 0; n < segments.Length; n++)
            {
                jsonElement = jsonElement.TryGetProperty(segments[n], out JsonElement value) ? value : default;

                if (jsonElement.ValueKind == JsonValueKind.Null ||
                    jsonElement.ValueKind == JsonValueKind.Undefined)
                {
                    return default;
                }
            }

            return jsonElement;
        }
    }
}
