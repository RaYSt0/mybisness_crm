import type { BusinessCategory, ClientRecord, DashboardSummary, WorkspaceSetup } from "./model";

const API_URL = import.meta.env.VITE_API_URL?.trim().replace(/\/$/, "") ?? "";
export const isWorkspaceApiConfigured = Boolean(API_URL);

interface OrganizationResponse { id: number }
interface ApiClient {
  id: number; name: string; contact: string | null; email: string | null;
  status: ClientRecord["status"]; segment: string | null; note: string | null;
  created_at: string; updated_at: string;
}
interface WorkspaceResponse { organization_id: number; version: number; configuration: WorkspaceSetup }
interface ApiClientList { items: ApiClient[]; total: number }

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_URL) throw new Error("Адрес сервера не настроен");
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new Error("Не удалось подключиться к FastAPI. Проверьте, что backend запущен на порту 8001.");
  }
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const detail = body?.detail;
    throw new Error(typeof detail === "string" ? detail : `Ошибка сервера: ${response.status}`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

function toClient(value: ApiClient): ClientRecord {
  return {
    id: String(value.id), name: value.name, contact: value.contact ?? "", email: value.email ?? "",
    status: value.status, segment: value.segment ?? "", note: value.note ?? "",
    updatedAt: value.updated_at.slice(0, 10),
  };
}

function modulesFor(setup: WorkspaceSetup): string[] {
  return [...new Set(setup.entities.filter(item => item.enabled).map(item => item.section))];
}

export const workspaceApi = {
  async createOrganization(setup: WorkspaceSetup): Promise<number> {
    const value = await request<OrganizationResponse>("/organizations", {
      method: "POST",
      body: JSON.stringify({
        name: setup.businessName,
        owner_name: setup.ownerName,
        owner_email: setup.email,
        business_type: setup.category satisfies BusinessCategory,
        enabled_modules: modulesFor(setup),
      }),
    });
    return value.id;
  },
  async saveConfiguration(organizationId: number, setup: WorkspaceSetup): Promise<number> {
    const value = await request<WorkspaceResponse>(`/organizations/${organizationId}/workspace`, {
      method: "PUT", body: JSON.stringify({ configuration: setup }),
    });
    return value.version;
  },
  async loadConfiguration(organizationId: number): Promise<WorkspaceResponse> {
    return request<WorkspaceResponse>(`/organizations/${organizationId}/workspace`);
  },
  async listClients(organizationId: number): Promise<ClientRecord[]> {
    const value = await request<ApiClientList>(`/organizations/${organizationId}/clients?limit=100`);
    return value.items.map(toClient);
  },
  async addClient(organizationId: number, client: Omit<ClientRecord, "id" | "updatedAt">): Promise<ClientRecord> {
    const value = await request<ApiClient>(`/organizations/${organizationId}/clients`, {
      method: "POST",
      body: JSON.stringify({
        name: client.name, contact: client.contact || null, email: client.email || null,
        status: client.status, segment: client.segment || null, note: client.note || null,
      }),
    });
    return toClient(value);
  },
  async dashboardSummary(organizationId: number): Promise<DashboardSummary> {
    return request<DashboardSummary>(`/organizations/${organizationId}/dashboard-summary`);
  },
};
