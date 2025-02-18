# Проект для скачивания пакетов с зависимостями

[Сайт для скачивания пакетов](http://azerqtech.pw/)

## Предложения

### Бэкенд 

#### Множественное скачивание

Файл: [PackagesController](./Backend/PackageDownloader.API/Controllers/PackagesController.cs).

Описание:

 Для метода API `GetPackagesAsArchive` контроллера `PackagesController` реализовать возможность приема массива объектов типа `PackageRequest` для возможности одновременного скачивания пакетов нескольких типов в одном архиве (NPM, Nuget). Изменить метод для скачивния архива на фронте.

 Сложность реализации: Средняя

#### Авторизация пользователя

Описание:

Сделать формы регистрации пользователя, с сохранением данных в БД, можно использовать JWT или OAuth 2.0.
У сущности пользовтеля  добавить флаг или перечисление типа  подписки на сервис (Будет использоваться, для последующей оплаты).

Сложность реализации: Выше среднего.

#### Подписка

Описание:

Несколько уровней подписки:
* Базовый (Бесплатно)

Ограничения на скачивания пакетов:
1. 5 скачиваний пакетов в день
2. 2 пакета в корзине
3. Нельзя скачивать одновременно несколько пакетов  из различных пакетных менеджеров

* Про
1. 10 скачиваний пакетов в день
2. 4 пакета в корзине
3. Нельзя скачивать одновременно несколько пакетов  из различных пакетных менеджеров


* Премиум 
1. 50 скачиваний пакетов в день
2. 8 пакетов в корзине
3. Можно скачивать одновременно несколько пакетов  из различных пакетных менеджеров


#### История списков скачанных пакетов (Корзин) 
Описание:
Хранить в базе все списки пактов, которые выкачивал пользователь


