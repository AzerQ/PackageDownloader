using System.Text.Json;

namespace PackageDownloader.Infrastructure.Extensions
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

        public static IEnumerable<string> GetStrings(this JsonElement jsonElement, string? arrayFieldName = default, string? itemField = default)
        {
            JsonElement values = jsonElement;

            if (arrayFieldName is not null)
            {
                bool hasProperty = jsonElement.TryGetProperty(arrayFieldName, out values);
                if (!hasProperty)
                    return [];
            }

            IEnumerable<string> stringValues =
                values.EnumerateArray()
                .Select(val =>
                {
                    return itemField == default ? val.GetStringOrDefault()
                    : val.GetProperty(itemField).GetStringOrDefault();
                });

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
