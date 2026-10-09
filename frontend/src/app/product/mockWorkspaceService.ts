import { getBusinessTemplate } from "./catalog";
import type { BusinessCategory, ClientRecord, PersistedWorkspace, RegistrationDraft, WorkspaceData, WorkspaceSetup } from "./model";

const KEY = "flowbiz.workspace.v1";
const DRAFT_KEY = "flowbiz.registration.v1";
const today = new Date();
const date = (offset: number) => { const value = new Date(today); value.setDate(value.getDate() + offset); return value.toISOString().slice(0, 10); };

export const emptyDraft: RegistrationDraft = { ownerName: "", email: "", businessName: "" };
export function readDraft(): RegistrationDraft { try { return { ...emptyDraft, ...JSON.parse(localStorage.getItem(DRAFT_KEY) || "{}") }; } catch { return emptyDraft; } }
export function saveDraft(draft: RegistrationDraft) { localStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); }
export function readWorkspace(): PersistedWorkspace | null { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch { return null; } }
export function persistWorkspace(value: PersistedWorkspace) { localStorage.setItem(KEY, JSON.stringify(value)); }

export function initialSetup(draft: RegistrationDraft, category: BusinessCategory, description: string): WorkspaceSetup {
  const template = getBusinessTemplate(category);
  return { ...draft, workspaceName: draft.businessName || "Моё рабочее пространство", category, description, ...template, createdAt: new Date().toISOString() };
}

export function seedWorkspace(category: BusinessCategory): WorkspaceData {
  const people = category === "wellness" ? ["Анна Смирнова", "Мария Волкова", "Елена Кузнецова", "Ольга Лебедева"] : category === "cleaning" ? ["Ирина Павлова", "Александр Морозов", "Наталья Соколова", "Дмитрий Орлов"] : ["Миша Иванов", "София Петрова", "Артём Сидоров", "Алиса Фёдорова"];
  const service = category === "wellness" ? "Массаж" : category === "cleaning" ? "Уборка объекта" : category === "repair" ? "Диагностика" : category === "education" ? "Английский" : category === "field" ? "Выезд к клиенту" : "Тренировка";
  const clients: ClientRecord[] = people.map((name, i) => ({ id: `client-${i + 1}`, name, contact: `+7 9${10 + i} 555-${String(10 + i).padStart(2, "0")}-${String(20 + i).padStart(2, "0")}`, email: `client${i + 1}@example.ru`, status: i === 0 ? "attention" : i === 1 ? "new" : "active", segment: category === "wellness" ? "Постоянный клиент" : category === "cleaning" ? "Квартира · центр" : "Группа «Старт»", updatedAt: date(-i), note: "Предпочитает получать напоминания заранее." }));
  return {
    clients,
    schedule: ["09:00", "10:30", "12:00", "14:30"].map((time, i) => ({ id: `slot-${i}`, title: service, client: people[i], specialist: ["Алексей", "Мария", "Иван", "Ольга"][i], time, duration: i % 2 ? 60 : 90, status: i === 1 ? "waiting" : i === 0 ? "done" : "confirmed", color: ["violet", "blue", "green", "amber"][i] })),
    groups: ["Начальная", "Продолжающая", "Индивидуальная"].map((name, i) => ({ id: `group-${i}`, name: category === "wellness" ? ["Классический массаж", "Спортивный массаж", "Консультация"][i] : category === "cleaning" ? ["Регулярная уборка", "Генеральная уборка", "После ремонта"][i] : `${name} группа`, lead: ["Алексей", "Мария", "Иван"][i], members: [12, 9, 5][i], schedule: ["Пн, Ср · 09:00", "Вт, Чт · 12:00", "Сб · 14:30"][i], status: i === 2 ? "recruiting" : "active" })),
    team: ["Алексей Смирнов", "Мария Иванова", "Иван Петров"].map((name, i) => ({ id: `team-${i}`, name, role: ["Специалист", "Администратор", "Руководитель направления"][i], email: `team${i}@example.ru`, status: i === 2 ? "away" : "active", initials: name.split(" ").map(x => x[0]).join("") })),
    payments: people.map((client, i) => ({ id: `payment-${i}`, client, purpose: i === 2 ? "Абонемент · июнь" : service, amount: [6800, 4500, 8200, 5200][i], date: date(-i), status: i === 0 ? "overdue" : i === 1 ? "pending" : "paid" })),
    documents: ["Договор на оказание услуг", "Справка клиента", "Согласие на обработку данных", "Акт выполненных работ"].map((name, i) => ({ id: `doc-${i}`, name, owner: people[i], type: ["Договор", "Справка", "Согласие", "Акт"][i], uploadedAt: date(-30 + i), ...(i === 1 ? { expiresAt: date(9), status: "expiring" as const } : { status: i === 2 ? "review" as const : "valid" as const }) })),
    tasks: ["Позвонить семье Ивановых", "Проверить срок документа", "Подготовить расписание на неделю", "Сверить поступления за месяц"].map((title, i) => ({ id: `task-${i}`, title, detail: ["Уточнить удобное время для первого занятия", "Срок действия заканчивается через 9 дней", "Опубликовать обновления для клиентов", "Два платежа требуют внимания"][i], due: date(i + 1), priority: i < 2 ? "high" : "normal", done: i === 3, client: people[i] })),
  };
}

export const mockWorkspaceService = {
  async load(): Promise<PersistedWorkspace | null> { await Promise.resolve(); return readWorkspace(); },
  async save(value: PersistedWorkspace): Promise<void> { persistWorkspace(value); },
  async addClient(data: Omit<ClientRecord, "id" | "updatedAt">): Promise<ClientRecord> { await Promise.resolve(); return { ...data, id: crypto.randomUUID(), updatedAt: date(0) }; },
};
