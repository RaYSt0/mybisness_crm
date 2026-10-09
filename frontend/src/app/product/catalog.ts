import type { BusinessCategory, EntityDefinition, SuggestedItem } from "./model";

export const BUSINESS_CATEGORIES: { id: BusinessCategory; title: string; description: string; icon: string }[] = [
  { id: "kids", title: "Детские кружки и секции", description: "Занятия, группы и связь с родителями", icon: "Sparkles" },
  { id: "sport", title: "Спорт", description: "Студии, школы и спортивные команды", icon: "Dumbbell" },
  { id: "education", title: "Образование", description: "Курсы, репетиторство и учебные центры", icon: "GraduationCap" },
  { id: "wellness", title: "Массаж и услуги", description: "Клиенты, мастера и записи на услуги", icon: "Heart" },
  { id: "cleaning", title: "Клининг", description: "Объекты, заказы, выезды и сотрудники", icon: "SprayCan" },
  { id: "field", title: "Выездные услуги", description: "Заявки, маршруты и работа на объектах", icon: "MapPin" },
  { id: "repair", title: "Ремонт и сервис", description: "Клиенты, заказы и этапы выполнения", icon: "Wrench" },
  { id: "other", title: "Другое", description: "Расскажите, как устроен ваш бизнес", icon: "BriefcaseBusiness" },
];

type Template = { entities: EntityDefinition[]; processes: SuggestedItem[]; automations: SuggestedItem[] };

const entity = (id: string, name: string, plural: string, section: EntityDefinition["section"], fields: EntityDefinition["fields"]): EntityDefinition => ({ id, name, plural, section, enabled: true, fields });
const textField = (id: string, label: string, type: EntityDefinition["fields"][number]["type"] = "text") => ({ id, label, type });
const item = (id: string, title: string, detail: string): SuggestedItem => ({ id, title, detail, enabled: true });

const client = entity("clients", "Клиент", "Клиенты", "clients", [textField("name", "Имя"), textField("contact", "Телефон", "phone"), textField("email", "Email", "email"), textField("segment", "Группа / сегмент")]);
const team = entity("team", "Сотрудник", "Сотрудники", "team", [textField("name", "Имя"), textField("role", "Роль"), textField("contact", "Телефон", "phone")]);
const schedule = entity("schedule", "Запись", "Расписание", "schedule", [textField("title", "Название"), textField("date", "Дата", "date"), textField("specialist", "Ответственный")]);
const payment = entity("payments", "Платёж", "Оплаты", "payments", [textField("client", "Клиент"), textField("amount", "Сумма"), textField("date", "Дата", "date")]);
const documents = entity("documents", "Документ", "Документы", "documents", [textField("name", "Название"), textField("owner", "Кому принадлежит"), textField("expires", "Срок действия", "date")]);
const task = entity("tasks", "Задача", "Задачи", "tasks", [textField("title", "Название"), textField("due", "Срок", "date"), textField("owner", "Ответственный")]);

const templates: Record<BusinessCategory, Template> = {
  kids: {
    entities: [client, entity("groups", "Группа", "Группы", "groups", [textField("name", "Название"), textField("lead", "Тренер"), textField("schedule", "Расписание")]), team, schedule, payment, documents, task],
    processes: [item("enroll", "Запись нового ребёнка", "От заявки до первой тренировки"), item("attendance", "Посещение занятия", "Отметить присутствие и связаться с родителем"), item("renewal", "Продление абонемента", "Контролировать остаток занятий и оплату"), item("certificate", "Контроль справок", "Следить за сроками документов")],
    automations: [item("renewal-reminder", "Продление абонемента", "Напомнить родителю за 5 дней до окончания"), item("certificate-reminder", "Срок справки", "Создать задачу за 14 дней до окончания"), item("missed-session", "Пропуск занятия", "Напомнить администратору связаться с семьёй")],
  },
  sport: {
    entities: [client, entity("groups", "Группа", "Группы", "groups", [textField("name", "Название"), textField("lead", "Тренер"), textField("schedule", "Расписание")]), team, schedule, payment, documents, task],
    processes: [item("enroll", "Запись участника", "Заявка, пробное занятие, оформление"), item("attendance", "Проведение тренировки", "Группа, тренер и посещаемость"), item("renewal", "Продление абонемента", "Контроль оплаты и остатка занятий"), item("equipment", "Подготовка к занятию", "Инвентарь и зал к началу тренировки")],
    automations: [item("renewal-reminder", "Продление абонемента", "Напомнить клиенту за 5 дней"), item("missed-session", "Пропуск тренировки", "Создать задачу администратору"), item("payment-reminder", "Задолженность", "Напомнить о неоплаченном абонементе")],
  },
  education: {
    entities: [client, entity("groups", "Курс", "Группы и курсы", "groups", [textField("name", "Название"), textField("lead", "Преподаватель"), textField("schedule", "Расписание")]), team, schedule, payment, documents, task],
    processes: [item("lead", "Новая заявка", "От первого обращения до записи на курс"), item("lesson", "Проведение занятия", "Группа, преподаватель и материалы"), item("progress", "Успеваемость", "Фиксировать прогресс и обратную связь"), item("renewal", "Продление обучения", "Напоминать о следующем модуле")],
    automations: [item("course-start", "Старт курса", "Создать задачу преподавателю перед началом"), item("payment-reminder", "Оплата обучения", "Напомнить об ожидаемом платеже"), item("feedback", "Обратная связь", "Запросить отзыв после завершения курса")],
  },
  wellness: {
    entities: [client, entity("groups", "Услуга", "Услуги", "groups", [textField("name", "Название"), textField("lead", "Мастер"), textField("schedule", "Длительность")]), team, schedule, payment, documents, task],
    processes: [item("booking", "Запись клиента", "Выбрать услугу, мастера и время"), item("visit", "Проведение услуги", "Подготовить кабинет и отметить результат"), item("repeat", "Повторный визит", "Запланировать следующий визит"), item("payment", "Оплата", "Зафиксировать оплату услуги")],
    automations: [item("booking-reminder", "Напоминание о записи", "Отправить сообщение за день до визита"), item("repeat-visit", "Повторный визит", "Напомнить клиенту через 3 недели"), item("review", "Отзыв клиента", "Запросить обратную связь после услуги")],
  },
  cleaning: {
    entities: [client, entity("groups", "Объект", "Объекты", "groups", [textField("name", "Адрес / название"), textField("lead", "Ответственный"), textField("schedule", "Тип уборки")]), team, schedule, payment, documents, task],
    processes: [item("request", "Новая заявка", "Оценка объёма и согласование стоимости"), item("visit", "Выезд бригады", "Назначить сотрудников и время"), item("quality", "Контроль качества", "Подтвердить результат и собрать отзыв"), item("invoice", "Расчёт с клиентом", "Сформировать оплату по заказу")],
    automations: [item("visit-reminder", "Предстоящий выезд", "Напомнить бригаде за день"), item("invoice-reminder", "Ожидает оплаты", "Создать задачу администратору"), item("quality-check", "Проверка качества", "Запросить оценку после заказа")],
  },
  field: {
    entities: [client, entity("groups", "Объект", "Объекты", "groups", [textField("name", "Название / адрес"), textField("lead", "Ответственный"), textField("schedule", "Интервал работ")]), team, schedule, payment, documents, task],
    processes: [item("request", "Обработка заявки", "Уточнить детали и назначить исполнителя"), item("visit", "Выезд на объект", "Согласовать адрес, время и состав работ"), item("report", "Отчёт о работе", "Зафиксировать результат и материалы"), item("payment", "Оплата заказа", "Сформировать счёт и проверить оплату")],
    automations: [item("visit-reminder", "Предстоящий выезд", "Напомнить исполнителю о маршруте"), item("follow-up", "Контроль результата", "Связаться с клиентом после работ"), item("payment-reminder", "Ожидает оплаты", "Создать напоминание менеджеру")],
  },
  repair: {
    entities: [client, entity("groups", "Заказ", "Заказы", "groups", [textField("name", "Номер / описание"), textField("lead", "Мастер"), textField("schedule", "Срок")]), team, schedule, payment, documents, task],
    processes: [item("request", "Приём заказа", "Описание проблемы и оценка работ"), item("estimate", "Согласование сметы", "Согласовать стоимость и сроки"), item("work", "Выполнение работ", "Назначить мастера и этапы"), item("handover", "Выдача заказа", "Подтвердить результат и оплату")],
    automations: [item("deadline", "Срок заказа", "Напомнить о приближении срока"), item("approval", "Смета ожидает ответа", "Создать задачу менеджеру"), item("warranty", "Гарантийный срок", "Напомнить о контрольной проверке")],
  },
  other: {
    entities: [client, entity("groups", "Проект", "Проекты", "groups", [textField("name", "Название"), textField("lead", "Ответственный"), textField("schedule", "Срок")]), team, schedule, payment, documents, task],
    processes: [item("request", "Новое обращение", "От первого контакта до договорённости"), item("delivery", "Выполнение работы", "Ответственный, этап и срок"), item("payment", "Оплата", "Контроль выставленного счёта"), item("follow-up", "Связь с клиентом", "Зафиксировать следующий шаг")],
    automations: [item("deadline", "Срок задачи", "Напомнить ответственному заранее"), item("payment-reminder", "Ожидает оплаты", "Создать напоминание о счёте"), item("follow-up", "Нет следующего шага", "Напомнить менеджеру связаться с клиентом")],
  },
};

export function getBusinessTemplate(category: BusinessCategory): Template {
  const value = templates[category];
  return structuredClone(value);
}

export const SECTION_LABELS: Record<string, string> = {
  clients: "Клиенты",
  schedule: "Расписание",
  groups: "Группы и услуги",
  team: "Сотрудники",
  payments: "Оплаты",
  documents: "Документы",
  tasks: "Задачи",
  automations: "Автоматизации",
  reports: "Отчёты",
};
