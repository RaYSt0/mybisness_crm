# Backend plan для FlowBiz

## Цель и границы

FlowBiz — multi-tenant операционная система для малого бизнеса. Backend обслуживает регистрацию, изоляцию организаций, конфигурируемые рабочие пространства и обычные бизнес-операции. Этот документ описывает целевую архитектуру по созданному frontend; сервер и AI в рамках frontend-задачи не реализованы.

## Рекомендуемая архитектура

Начать с модульного монолита на имеющемся FastAPI, PostgreSQL и SQLAlchemy/SQLModel, выделяя строгие доменные модули и фоновые задачи. Не начинать с распределённых микросервисов: для учебного и раннего SaaS-проекта это увеличит стоимость транзакций, локального запуска и миграций. Границы модулей должны позволять вынести отдельные сервисы позже.

1. **Identity** — регистрация, подтверждение email, сессии/токены, восстановление доступа.
2. **Organizations & Access** — организации, участники, роли и права.
3. **Workspace Configuration** — версии сущностей, полей, связей, представлений и статусов.
4. **Records** — CRUD, фильтрация, связи, импорт/экспорт и поиск записей.
5. **Operations** — клиенты, расписание/записи, группы или услуги, задачи, платежи, документы.
6. **Workflow** — события, условия, actions, планирование и повторные попытки.
7. **Notifications & Integrations** — каналы, адаптеры, delivery state и webhooks.
8. **Analytics & Audit** — tenant-scoped агрегаты и неизменяемый журнал действий.
9. **AI Configuration** — анализ описания бизнеса и безопасная генерация черновика конфигурации.

На раннем этапе эти модули работают в одном приложении и одной PostgreSQL базе. Почта, workflow jobs и интеграционные доставки выполняются через очередь фоновых задач/outbox, чтобы HTTP-запрос не зависел от внешнего канала.

## Multi-tenant модель и изоляция

- `User`: id, email (нормализованный уникальный идентификатор), password hash, имя, verified_at, состояние.
- `Organization`: юридический/бизнес-контекст и владелец.
- `Workspace`: рабочая область организации, название, локаль, timezone и опубликованная версия конфигурации.
- `Membership`: user_id, organization_id, role_id, состояние приглашения; доступ проверяется в каждом запросе.
- `Role`, `Permission`, `RolePermission`: роли организации и права на действия/сущности.

Все бизнес-таблицы содержат `organization_id` и/или `workspace_id`; запросы всегда добавляют tenant scope из проверенного членства, никогда из недоверенного тела запроса. Использовать составные внешние ключи/уникальные ограничения с tenant ID, чтобы запись одного арендатора нельзя было связать с другой. Проверять tenant scope и на уровне сервиса, и в PostgreSQL Row-Level Security как дополнительный барьер, если эксплуатационная модель позволяет надёжно задавать tenant на соединении. Тестировать горизонтальный доступ между двумя организациями для каждого endpoint.

Пароли хранить только как стойкий хэш, секреты — в secret store/env вне репозитория. Для cookie-сессий включить Secure/HttpOnly/SameSite и CSRF-защиту; при bearer token использовать короткий срок access token, ротацию refresh token и отзыв сессий. Авторизация сочетает роль, действие, workspace, enabled configuration и ограничения конкретной записи. Изменения членства/прав и критические действия пишутся в аудит.

## Схема данных

### Основные таблицы

- `users`, `organizations`, `workspaces`, `memberships`, `roles`, `permissions`, `role_permissions`, `invitations`.
- `workspace_config_versions`: workspace_id, version, state (`draft`, `published`, `superseded`), schema JSONB, source (`template`, `user`, `ai`), created_by, timestamps, validation report. Публикация атомарно меняет активную версию.
- `entity_definitions`: config_version_id, key, singular/plural labels, icon, enabled, order.
- `field_definitions`: entity_id, key, label, type, required, default, options, validation, visibility/index flags.
- `relation_definitions`: source/target entities, type (one-to-one/one-to-many/many-to-many), labels and delete policy.
- `status_definitions`, `view_definitions`: допустимые состояния и пользовательские списки/дашборды.
- `entity_records`: workspace_id, entity_key, record_id, configuration_version, common columns (`name`, `status`, timestamps, created_by), `custom_data JSONB`, archived_at, optimistic `revision`.
- `record_relations`: tenant-scoped relations between record IDs, relation key, metadata, constraints.
- `workflow_definitions`, `workflow_versions`, `workflow_runs`, `workflow_steps`.
- `tasks`, `documents`, `files`, `schedule_events`/`appointments`, `payments`, `notifications`, `audit_logs`, `outbox_events`, `integration_connections`, `webhook_subscriptions`, `webhook_deliveries`.

### Гибкая схема

Использовать гибрид: стабильные и часто запрашиваемые операции (tenant, owner, timestamps, lifecycle, payment amounts, appointment dates) хранятся в реляционных типизированных таблицах; настраиваемые поля бизнес-записей — JSONB, описанный versioned metadata. Это даёт раннюю гибкость без создания физической таблицы на каждый вид сущности. Индексы для часто используемых custom fields создавать контролируемо, через GIN или выделенные expression indexes после измерения нагрузки. Не допускать произвольный SQL из пользовательской конфигурации.

Когда календарь, платежи или другие домены получают жёсткие инварианты и внешние интеграции, хранить их в собственных таблицах, а в конфигурируемых сущностях показывать связанное представление. Не хранить всю бизнес-систему невалидированным JSON blob: это ухудшит tenant FK, целостность, поиск и отчётность.

Конфигурация версионируется. Запись хранит версию схемы; при изменении поле не удаляется физически сразу. Нужна стратегия совместимости: безопасные rename aliases, defaults для добавленных полей, миграции данных в фоне и обратимое восстановление опубликованной версии. Архивирование отделено от удаления; удаления и retention документируются.

## Конфигуратор

Публичная схема конфигурации должна позволять определить сущности, ключи и подписи, поля/типы/валидацию, связи, статусы, формы, таблицы, фильтры, порядок меню и dashboard widgets. Workflow описывает trigger, проверяемые условия и список разрешённых actions. Роли ссылаются на стабильные entity/action keys. Dashboard хранит только layout/widget configuration; его значения считаются из авторизованных API.

Сервер валидирует JSON Schema и дополнительные семантические ограничения: уникальность key, существование target relation, допустимые типы, циклические ссылки, права на поля, разрешённые действия, лимиты размера/сложности и совместимость опубликованных record values. Ключи технические и стабильные, пользовательские подписи меняемы. Конфигурацию нельзя применять прямо из браузера без серверной проверки и публикации.

## API и контракт

Версионировать `/api/v1`. Базовые группы: `/auth`, `/organizations`, `/workspaces`, `/workspaces/{id}/configurations`, `/workspaces/{id}/entities/{key}/records`, `/appointments`, `/tasks`, `/documents`, `/payments`, `/workflows`, `/reports`, `/integrations`. Использовать Pydantic request/response DTOs, UUID IDs, pagination cursor/page, сортировку и фильтрацию по allowlist. Мутации поддерживают идемпотентность там, где возможны повторы; обновления записей принимают revision/ETag для обнаружения конфликтов. Единые ошибки содержат код, безопасное сообщение и correlation ID.

Файлы загружаются напрямую в приватное object storage через короткоживущий signed URL; API сохраняет метаданные, tenant ownership, MIME/size/checksum и состояние проверки. Не класть бинарные данные в PostgreSQL.

## Workflow и уведомления

Модель workflow: `trigger` (событие записи или time-based), `conditions` (ограниченные декларативные выражения), `actions` (создать задачу, уведомить, изменить допустимый статус). Trigger и actions — типизированные версии JSON схем; только сервер выполняет действия. Ввести лимиты, dry-run/preview, журнал с причиной срабатывания и дедупликацией по событию. Запускать через transactional outbox и worker, учитывать retry/backoff, dead-letter и pause/kill switch. Никогда не `eval` пользовательский код.

`notifications` хранят адресата, канал, шаблон/version, статус доставки и provider reference. Внутренние уведомления — первый канал; email/Telegram/WhatsApp включаются адаптерами с проверкой доступности и согласием адресата.

## AI слой

```text
Описание бизнеса + выбранная категория
  → безопасная обработка и ограничение PII
  → модель с версионируемым prompt/schema
  → structured proposal: summary, entities/fields, relations, processes, workflows, dashboard
  → Pydantic/JSON Schema validation + domain validation + policy checks
  → черновик версии config
  → пользователь редактирует и подтверждает
  → publish атомарно, сохраняется audit/version
```

AI возвращает строго структурированный JSON без исполняемого кода. Сервер валидирует поля, разрешённые типы/действия, лимиты, relation targets и отсутствие системных/tenant ключей. При невалидном выводе — ограниченная повторная попытка или статический шаблон с ясным состоянием ошибки. Модель никогда сама не публикует структуру, не создаёт внешнюю интеграцию и не имеет DB credentials. Хранить model/prompt/schema version, исходный запрос с политикой хранения, очищенный результат, ошибки, валидированный draft и user edits. Пользователь всегда может сравнить, изменить, принять или отклонить draft; опубликованная конфигурация получает новую версию и аудит.

## Интеграции

Каждое подключение — tenant-owned `integration_connection` со статусом, scoped encrypted credentials/token, capability flags и временем последней синхронизации. Секреты шифруются вне обычных полей приложения; доступ ограничен и аудитируется.

- Telegram и WhatsApp: adapters, шаблоны, opt-in/opt-out, лимиты и delivery receipts; учитывать ограничения платформ и согласия получателей.
- Email: provider adapter, verified sender, шаблоны, bounce/unsubscribe.
- Календарь: Google/Microsoft адаптеры, OAuth scopes, external event IDs, синхронизация конфликтов.
- Платежи: provider adapter/webhook signature verification, idempotent events, refund/charge status; не хранить карточные реквизиты.
- Файлы: S3-compatible object storage, quarantine/virus scan, signed URL, retention.
- Онлайн-кассы и бухгалтерия/1С: отдельные коннекторы и mapping layer; синхронизация с retry, журналом ошибок и ручной коррекцией.
- Webhooks/API: scoped API keys, подписанные outgoing webhooks, rotation, rate limit, retries и версии событий.

Все внешние вызовы идут через адаптеры и очередь/outbox, а не из бизнес-транзакции напрямую.

## Безопасность, наблюдаемость и тестирование

Записывать audit actor, tenant, action, object, timestamp, correlation id и безопасные before/after поля; исключать пароли, токены и избыточные медицинские/персональные данные. Шифрование в transit/at rest, минимизация хранения, резервные копии и восстановление, rate limits, защита от enumeration и SSRF, валидация webhook signature. Медицинские справки и чувствительные сведения требуют отдельного решения о юрисдикции, доступах, сроках хранения и правовых основаниях до реального запуска.

Метрики: latency/error по endpoint, очередь и retries, интеграционные delivery status, AI validation pass/fail и стоимость без содержимого пользовательских данных в логах. Тесты: unit domain/validation, API contract, миграции, tenant isolation (обязательно два арендатора), workflow idempotency, интеграционные sandbox и end-to-end registration-to-workspace.

## Предлагаемый порядок реализации

1. Уточнить MVP-предметную область, роли, timezone, сроки хранения и политику удаления.
2. Identity, Organizations, Memberships, tenant-scoped Workspace API и тесты изоляции.
3. Версионируемый config draft/publish с шаблонами; AI пока выключен.
4. Универсальные records/fields/relations с валидацией и audit.
5. Клиенты и задачи; затем календарь, документы, платежи как доменные модули.
6. Уведомления/outbox и безопасные workflow triggers/actions.
7. Аналитика, AI draft generation и интеграции отдельными итерациями.

## Решения до backend реализации

- Идентичность организации и допускается ли несколько организаций на одного пользователя.
- Какие данные нужны в универсальной записи, а какие имеют отдельный домен/таблицу.
- Модель связей и переноса записей при публикации новой схемы.
- Ролевой MVP (владелец, администратор, исполнитель, только просмотр) и granular permissions.
- Authentication/session transport, подтверждение почты и восстановление аккаунта.
- Выбор очереди, object storage, почтового/платёжного провайдера и deployment региона.
- Сроки хранения/удаления файлов и чувствительных данных, резервное копирование и audit retention.
- AI provider, допустимые пользовательские данные, бюджет, качество предложений и политика отказа/редактирования.
