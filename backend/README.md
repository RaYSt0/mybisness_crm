# Backend · лабораторная №3

Серверная часть FlowBiz на FastAPI. Хранит организации, версионируемую конфигурацию рабочего пространства и универсальных клиентов в PostgreSQL через SQLAlchemy 2.x. Frontend подключается через `frontend/.env` и `VITE_API_URL`: завершение настройки создаёт организацию и сохраняет конфигурацию, список и добавление клиентов идут через API, а dashboard получает рассчитанную сервером сводку. Старый API учеников оставлен для предыдущей работы. Настоящей авторизации пока нет: API учебное и предназначено для локальной демонстрации.

## Структура

```text
app/
  main.py                 создание FastAPI-приложения
  api/routes/             HTTP-маршруты организаций, клиентов, конфигурации и учеников
  core/config.py          настройки из окружения
  db/                     engine, сессии, база и инициализация схемы
  models/                 таблицы организаций, клиентов, конфигурации и учеников
  schemas/                проверка входных и выходных данных Pydantic
  repositories/           запросы к SQLAlchemy и серверные агрегаты
  services/               бизнес-правила, tenant scope и 404
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
uvicorn app.main:app --reload --port 8001
```

Локальное приложение создаёт отсутствующие таблицы при запуске (`create_all`). Для последующих лабораторных и развития схемы следует добавить Alembic. В примере используются только демонстрационные учётные данные. Не публикуйте такую конфигурацию в production.

Документация API: <http://127.0.0.1:8001/docs>. Проверка состояния: `GET /health` или `GET /api/v1/health`.

## Модель данных

- `organizations`: название персональной CRM, владелец, уникальный email владельца, пресет, включённые модули (JSONB).
- `clients`: имя, контакты, статус, сегмент и заметка клиента; каждая запись привязана к `organization_id`.
- `workspace_configurations`: текущая JSON-конфигурация рабочего пространства, номер версии и время изменения.
- `students`: прежняя модель ученика для совместимости с лабораторной №2.
- Организация имеет связанные записи клиентов, конфигурацию и учеников; удаление организации удаляет связанные серверные данные.

Основные запросы:

| Метод и путь | Назначение |
| --- | --- |
| `POST /api/v1/organizations` | Создать организацию |
| `GET /api/v1/organizations` | Получить организации постранично |
| `GET /api/v1/organizations/{id}` | Получить организацию и её учеников |
| `PATCH /api/v1/organizations/{id}` | Изменить настройки организации |
| `DELETE /api/v1/organizations/{id}` | Удалить организацию и связанные записи |
| `PUT /api/v1/organizations/{id}/workspace` | Проверить и сохранить JSON-конфигурацию, увеличить её версию |
| `GET /api/v1/organizations/{id}/workspace` | Получить актуальную конфигурацию рабочего пространства |
| `GET /api/v1/organizations/{id}/dashboard-summary` | Рассчитать число клиентов по статусам на сервере |
| `POST /api/v1/organizations/{id}/clients` | Добавить клиента |
| `GET /api/v1/organizations/{id}/clients` | Получить клиентов, поиск по имени, сегменту и контакту |
| `GET /api/v1/organizations/{id}/clients/{client_id}` | Получить карточку клиента |
| `PATCH /api/v1/organizations/{id}/clients/{client_id}` | Изменить поля или статус клиента |
| `DELETE /api/v1/organizations/{id}/clients/{client_id}` | Удалить клиента |
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
