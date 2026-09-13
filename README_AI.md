> Историческая заметка о первоначальном прототипе. Актуальное состояние и запуск описаны в README.md; проверка лабораторной — в docs/lab-1-audit.md.

# README_AI.md

## Что сделано
- Проведен аудит текущего Vite + React прототипа из Figma: выявлены захардкоженные данные в `dashboard`, `settings`, `constructor`, `sidebar`.
- Создан централизованный конфиг домена: [src/app/config/business-config.ts](/Users/timur/Desktop/Projects/mybisness_crm/src/app/config/business-config.ts).
- Добавлен state-слой с `localStorage` для бизнес-конфигурации: [src/app/state/use-business-config.ts](/Users/timur/Desktop/Projects/mybisness_crm/src/app/state/use-business-config.ts).
- Обновлен корневой контейнер приложения для передачи конфигурации в представления: [src/app/App.tsx](/Users/timur/Desktop/Projects/mybisness_crm/src/app/App.tsx).
- Переработан `Config Constructor` в многошаговый wizard с сохранением выбора пресета и модулей: [src/app/components/views/config-constructor-view.tsx](/Users/timur/Desktop/Projects/mybisness_crm/src/app/components/views/config-constructor-view.tsx).
- Добавлена модульная адаптация интерфейса:
  - Сайдбар показывает `Финансы` и быстрые действия в зависимости от включенных модулей: [src/app/components/layout/sidebar.tsx](/Users/timur/Desktop/Projects/mybisness_crm/src/app/components/layout/sidebar.tsx).
  - Dashboard теперь action-first и условно рендерит аналитические виджеты по модулям: [src/app/components/views/dashboard-view.tsx](/Users/timur/Desktop/Projects/mybisness_crm/src/app/components/views/dashboard-view.tsx).
  - Профиль ученика динамически подстраивает вкладки (платежи/документы) под модули: [src/app/components/views/student-profile-view.tsx](/Users/timur/Desktop/Projects/mybisness_crm/src/app/components/views/student-profile-view.tsx).
- Приведена ролевая модель к целевой RBAC (owner/admin/coach) и централизована матрица прав: [src/app/components/views/settings-view.tsx](/Users/timur/Desktop/Projects/mybisness_crm/src/app/components/views/settings-view.tsx).
- Выполнена проверка сборки: `npm run build` проходит успешно.

## Текущее состояние архитектуры
- UI-приложение работает как модульный frontend-конструктор на React + Vite.
- Источник истины для первичной бизнес-настройки: `BusinessConfig` (`presetId`, `enabledModules`).
- Конфигурация хранится локально в `localStorage` (ключ `mybusiness:business-config:v1`) и подготавливает переход к backend persistence.
- Основные доменные сущности (пресеты, модули, роли, RBAC) вынесены из компонентов в конфиг-слой.
- Представления стали адаптивными к включенным модулям, что снижает связанность и упрощает будущую модульную загрузку/feature flags.

## План на следующий шаг
- Вынести оставшиеся мок-данные (ученики, платежи, уведомления, метрики) в `src/app/mocks/*` и описать типы DTO под будущий Python + FastAPI / PostgreSQL + SQLAlchemy API.
- Ввести легковесный слой `services/` для чтения данных (пока mock service), чтобы заменить прямые константы в view-компонентах.
- Добавить базовую маршрутизацию (`react-router`) и guard-логику по ролям/модулям.
- Подготовить контракт API для onboarding-конструктора (`POST /business/setup`) и RBAC (`GET/PUT /roles/permissions`).
