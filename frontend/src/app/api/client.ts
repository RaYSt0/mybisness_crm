import type { BusinessConfig } from "../config/business-config";
import type { Student, StudentDetails } from "../data/students";

const API_URL = import.meta.env.VITE_API_URL?.trim().replace(/\/$/, "") ?? "";

export const isApiEnabled = Boolean(API_URL);

interface OrganizationResponse {
  id: number;
}

interface StudentResponse {
  id: number;
  name: string;
  group_name: string;
  guardian: string | null;
  phone: string | null;
  email: string | null;
  birth_date: string | null;
  notes: string | null;
  archived: boolean;
}

function studentFromApi(value: StudentResponse): Student {
  return {
    id: String(value.id),
    name: value.name,
    group: value.group_name,
    guardian: value.guardian ?? "",
    phone: value.phone ?? "",
    email: value.email ?? "",
    birthDate: value.birth_date ?? "",
    notes: value.notes ?? "",
    archived: value.archived,
  };
}

function studentToApi(value: StudentDetails) {
  return {
    name: value.name,
    group_name: value.group,
    guardian: value.guardian || null,
    phone: value.phone || null,
    email: value.email || null,
    birth_date: value.birthDate || null,
    notes: value.notes || null,
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_URL) throw new Error("Адрес API не настроен. Скопируйте frontend/.env.example в frontend/.env.");
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new Error(`Не удалось подключиться к API (${API_URL}). Проверьте, что backend запущен.`);
  }
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const detail = body?.detail;
    const message = Array.isArray(detail)
      ? detail.map((item: { msg?: string }) => item.msg).join("; ")
      : typeof detail === "string" ? detail : `Ошибка API: ${response.status}`;
    throw new Error(message);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function createOrganization(config: BusinessConfig): Promise<number> {
  const organization = await request<OrganizationResponse>("/organizations", {
    method: "POST",
    body: JSON.stringify({
      name: config.organizationName,
      owner_name: config.ownerName,
      owner_email: config.ownerEmail,
      business_type: config.presetId,
      enabled_modules: config.enabledModules,
    }),
  });
  return organization.id;
}

export async function updateOrganization(organizationId: number, config: BusinessConfig): Promise<void> {
  await request(`/organizations/${organizationId}`, {
    method: "PATCH",
    body: JSON.stringify({
      name: config.organizationName,
      business_type: config.presetId,
      enabled_modules: config.enabledModules,
    }),
  });
}

export async function listStudents(organizationId: number): Promise<Student[]> {
  const result = await request<{ items: StudentResponse[] }>(`/organizations/${organizationId}/students?limit=100`);
  return result.items.map(studentFromApi);
}

export async function createStudent(organizationId: number, details: StudentDetails): Promise<Student> {
  const result = await request<StudentResponse>(`/organizations/${organizationId}/students`, {
    method: "POST",
    body: JSON.stringify(studentToApi(details)),
  });
  return studentFromApi(result);
}

export async function updateStudent(organizationId: number, studentId: string, details: StudentDetails): Promise<Student> {
  const result = await request<StudentResponse>(`/organizations/${organizationId}/students/${studentId}`, {
    method: "PATCH",
    body: JSON.stringify(studentToApi(details)),
  });
  return studentFromApi(result);
}

export async function archiveStudent(organizationId: number, studentId: string, archived: boolean): Promise<void> {
  await request(`/organizations/${organizationId}/students/${studentId}`, {
    method: "PATCH",
    body: JSON.stringify({ archived }),
  });
}
