# PackageDownloader

## Тип пакетов GitHub

Пакет типа `GitHub` — это репозиторий, указываемый в `packageID` как `owner/repo`
(принимается и полный URL вида `https://github.com/owner/repo`).

### Версии

`GET /api/PackageInfo/GetPackageVersions?packageType=GitHub&packageName=owner/repo` возвращает:

| Версия | Что скачивается |
|---|---|
| `latest.source` | Всегда присутствует первой. Главная (default) ветка репозитория, упакованная в zip |
| `<tag>` | Ассеты релиза с этим тегом |
| `<tag>.source` | Исходники конкретного тега (в списке версий не отображается, но принимается при скачивании) |
| не указана | Ассеты последнего релиза |

### Типы артефактов

`GET /api/GitHub/packages/artifacts?packageId=owner/repo&version=<версия>` возвращает список
артефактов версии. Значение `artifactType` из ответа передаётся обратно в
`PackageDetails.ArtifactType` при подготовке скачивания:

| `artifactType` | Что скачивается |
|---|---|
| имя ассета | Один конкретный ассет релиза |
| `all` или не указан | Все ассеты релиза |
| `source` | Архив исходников тега вместо ассетов |

Если у релиза нет ассетов, скачиваются исходники его тега.

### Скачивание

Скачивание идёт через общий эндпоинт:

```http
POST /api/Packages/PreparePackagesDownloadLink
Content-Type: application/json

{
  "packageType": "GitHub",
  "packagesDetails": [
    { "packageID": "sharkdp/hyperfine", "packageVersion": "v1.20.0", "artifactType": "hyperfine_1.20.0_arm64.deb" },
    { "packageID": "sharkdp/hyperfine", "packageVersion": "latest.source" }
  ]
}
```

Примеры запросов — в `PackageDownloader.http`.

### Настройка

Анонимные обращения к GitHub API ограничены 60 запросами в час. Для повышения лимита
задайте персональный токен:

```json
{
  "GitHub": {
    "TOKEN": "ghp_..."
  }
}
```

или через переменную окружения `GitHub__TOKEN`.
