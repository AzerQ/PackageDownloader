# Этап сборки фронтенда
FROM node:26.5.1-bookworm-slim AS frontend-build
ARG NPM_VERSION=12.0.2
WORKDIR /app

RUN npm install --global "npm@${NPM_VERSION}"

# Копируем зависимости фронтенда и устанавливаем их
COPY Frontend/package-downloader-react/package*.json ./
RUN npm ci

# Копируем исходники фронтенда и собираем проект
COPY Frontend/package-downloader-react/ .
RUN npm run build

# Этап сборки бэкенда
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS backend-build
WORKDIR /src

# Копируем файлы решения и проектов
COPY Backend/*.sln .
COPY Backend/PackageDownloader.API/*.csproj ./PackageDownloader.API/
COPY Backend/PackageDownloader.Application/*.csproj ./PackageDownloader.Application/
COPY Backend/PackageDownloader.Core/*.csproj ./PackageDownloader.Core/
COPY Backend/PackageDownloader.Infrastructure/*.csproj ./PackageDownloader.Infrastructure/
COPY Backend/PackageDownloader.AI/*.csproj ./PackageDownloader.AI/
COPY Backend/PackageDownloader.Persistence/*.csproj ./PackageDownloader.Persistence/

# Восстанавливаем зависимости
RUN dotnet restore "PackageDownloader.API/PackageDownloader.API.csproj"

# Копируем весь исходный код
COPY Backend/ .

# Публикуем проект
RUN dotnet publish "PackageDownloader.API/PackageDownloader.API.csproj" -c Release -o /app/publish

# Финальный этап
FROM mcr.microsoft.com/dotnet/sdk:10.0
WORKDIR /app

# Добавляем в runtime те же версии Node.js и npm, что использовались для сборки frontend
COPY --from=frontend-build /usr/local/ /usr/local/

# Копируем собранный фронтенд
COPY --from=frontend-build /app/dist ./wwwroot

# Копируем собранный бэкенд
COPY --from=backend-build /app/publish .

# Открываем порты
EXPOSE 80
EXPOSE 443

# Настраиваем переменную окружения для биндинга на порт 80
ENV ASPNETCORE_URLS=http://+:80

# Запускаем приложение
ENTRYPOINT ["dotnet", "PackageDownloader.API.dll"]
