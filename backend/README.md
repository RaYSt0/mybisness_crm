# Backend · лабораторная №2

API для CRM на FastAPI. Хранит организации и связанных с ними учеников в PostgreSQL через SQLAlchemy 2.x. Настоящей авторизации пока нет: API учебное, а публичные маршруты предназначены только для локальной демонстрации.

## Структура

```text
app/
  main.py                 создание FastAPI-приложения
  api/routes/             HTTP-маршруты организаций и учеников
  core/config.py          настройки из окружения
  db/                     engine, сессии, база и инициализация схемы
  models/                 таблицы и связи SQLAlchemy
  schemas/                проверка входных и выходных данных Pydantic
  repositories/           CRUD-запросы к SQLAlchemy
  services/               бизнес-правила и 404
tests/                    API-проверки на SQLite in-memory
```

## Запуск с PostgreSQL

Из корня репозитория запустите базу данных:

```bash
docker compose up -d db
```

Compose публикует базу на `localhost:5433`, чтобы не конфликтовать с локально установленным PostgreSQL на стандартном порту. Если Docker недоступен, установите PostgreSQL и создайте базу `mybusiness_crm` и пользователя с правами на её таблицы; при другом адресе поправьте `DATABASE_URL`.

Затем в `backend/`:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Замените `DATABASE_URL` в `.env` для своих имени пользователя и пароля. Не коммитьте `.env` и не помещайте реальные секреты в Git.

```bash
uvicorn app.main:app --reload
```

Локальное приложение создаёт отсутствующие таблицы при запуске (`create_all`). Для последующих лабораторных и развития схемы следует добавить Alembic. В примере используются только демонстрационные учётные данные. Не публикуйте такую конфигурацию в production.

Документация API: <http://127.0.0.1:8000/docs>. Проверка состояния: `GET /health` или `GET /api/v1/health`.

## Модель данных

- `organizations`: название персональной CRM, владелец, уникальный email владельца, пресет, включённые модули (JSONB).
- `students`: ученик, группа, контакты, дата рождения, заметки и статус архивации.
- Связь `Organization 1 — N Student`. Ученик принадлежит одной организации; удаление организации каскадно удаляет её учеников.

Основные запросы:

| Метод и путь | Назначение |
| --- | --- |
| `POST /api/v1/organizations` | Создать организацию |
| `GET /api/v1/organizations` | Получить организации постранично |
| `GET /api/v1/organizations/{id}` | Получить организацию и её учеников |
| `PATCH /api/v1/organizations/{id}` | Изменить настройки организации |
| `DELETE /api/v1/organizations/{id}` | Удалить организацию и связанные записи |
| `POST /api/v1/organizations/{id}/students` | Добавить ученика в организацию |
| `GET /api/v1/organizations/{id}/students` | Список учеников, поиск и фильтр архива |
| `GET /api/v1/organizations/{id}/students/{student_id}` | Карточка ученика в организации |
| `PATCH /api/v1/organizations/{id}/students/{student_id}` | Изменить ученика / архивировать |
| `DELETE /api/v1/organizations/{id}/students/{student_id}` | Удалить ученика |

Ошибки валидации имеют статус 422, отсутствующие ресурсы — 404, повторный email владельца — 409. Успешное удаление возвращает 204.

## Тесты

```bash
cd backend
pytest -q
```

API-тесты подменяют PostgreSQL на отдельную SQLite in-memory базу, поэтому проверяются маршруты и CRUD без установленного PostgreSQL. Полный ручной прогон с реальной БД: запустить compose, API, создать организацию в Swagger UI, добавить ученика и проверить связанный список.
