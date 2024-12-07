# SkyProFitnes
Командная разработка приложения для спортивных тренировок

**SkyFitnessPro** — это веб-приложение для онлайн-тренировок, разработанное с использованием **React**, **TypeScript** и **Firebase**.

## Установка

1. **Клонируйте репозиторий:**

   ```bash
   git clone https://github.com/your-username/sky-fitnes-pro.git
   ```
   
2. **Перейдите в директорию проекта:**
3. **Установите зависимости:**
   ```bash
   npm install
   ```
4. **Создайте файл .env в корневой директории проекта и добавьте в него ваши конфигурационные данные Firebase:**
   ```bash
   REACT_APP_FIREBASE_API_KEY=your-api-key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain
   REACT_APP_FIREBASE_PROJECT_ID=your-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   REACT_APP_FIREBASE_APP_ID=your-app-id
   ```
5. **Запустите проект:**
   ```bash
   npm start
   ```

## Структура проекта
- src/api: Содержит функции для работы с Firebase API
- src/components: React компоненты
- src/contexts: React контексты
- src/hooks: Кастомные React хуки
- src/types: TypeScript типы и интерфейсы
- src/utils: Вспомогательные функции

## Технологии
- React
- TypeScript
- Firebase
- Tailwind CSS
- React Router

## Разработка
При разработке используются следующие команды:
- npm start: Запуск проекта в режиме разработки
- npm run build: Сборка проекта для продакшена
- npm run lint: Проверка кода с помощью ESLint
- npm test: Запуск тестов

Разработчики
- Александра - https://github.com/Balaura
- Артём - https://github.com/Artemisfree
- Назар - https://github.com/Fnami51



# Jira
* Выбрав задачу, откройте её и перейдите в раздел разработка. Нажмите там создать ветку и в открывшемся окне выберите ветку dev. 
* В коммит писать git commit -m "DEV-номер задачи дальше что делал". Пример: git commit -m "DEV-4 added auth component"
* Дочерние задачи использовать в крайнем случае (при тяжёлых тасках). Используйте описание задачи и флаги.
* Новые задачи сначало добавлять в Беклог