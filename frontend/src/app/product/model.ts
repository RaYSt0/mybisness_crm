export type BusinessCategory =
  | "kids"
  | "sport"
  | "education"
  | "wellness"
  | "cleaning"
  | "field"
  | "repair"
  | "other";

export type SectionId =
  | "clients"
  | "schedule"
  | "groups"
  | "team"
  | "payments"
  | "documents"
  | "tasks"
  | "automations"
  | "reports";

export interface RegistrationDraft {
  ownerName: string;
  email: string;
  businessName: string;
}

export interface FieldDefinition {
  id: string;
  label: string;
  type: "text" | "email" | "phone" | "date" | "select";
}

export interface EntityDefinition {
  id: string;
  name: string;
  plural: string;
  section: SectionId;
  enabled: boolean;
  fields: FieldDefinition[];
}

export interface SuggestedItem {
  id: string;
  title: string;
  detail: string;
  enabled: boolean;
}

export interface WorkspaceSetup extends RegistrationDraft {
  workspaceName: string;
  category: BusinessCategory;
  description: string;
  organizationId?: number;
  configurationVersion?: number;
  entities: EntityDefinition[];
  processes: SuggestedItem[];
  automations: SuggestedItem[];
  createdAt: string;
}

export interface DashboardSummary {
  total_clients: number;
  active_clients: number;
  new_clients: number;
  attention_clients: number;
}

export interface ClientRecord {
  id: string;
  name: string;
  contact: string;
  email: string;
  status: "active" | "new" | "attention" | "archived";
  segment: string;
  updatedAt: string;
  note: string;
}

export interface ScheduleItem {
  id: string;
  title: string;
  client: string;
  specialist: string;
  time: string;
  duration: number;
  status: "confirmed" | "waiting" | "done";
  color: string;
}

export interface GroupRecord {
  id: string;
  name: string;
  lead: string;
  members: number;
  schedule: string;
  status: "active" | "recruiting";
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  status: "active" | "away";
  initials: string;
}

export interface PaymentRecord {
  id: string;
  client: string;
  purpose: string;
  amount: number;
  date: string;
  status: "paid" | "pending" | "overdue";
}

export interface DocumentRecord {
  id: string;
  name: string;
  owner: string;
  type: string;
  uploadedAt: string;
  expiresAt?: string;
  status: "valid" | "expiring" | "review";
}

export interface TaskRecord {
  id: string;
  title: string;
  detail: string;
  due: string;
  priority: "high" | "normal" | "low";
  done: boolean;
  client?: string;
}

export interface WorkspaceData {
  clients: ClientRecord[];
  schedule: ScheduleItem[];
  groups: GroupRecord[];
  team: TeamMember[];
  payments: PaymentRecord[];
  documents: DocumentRecord[];
  tasks: TaskRecord[];
}

export interface PersistedWorkspace {
  setup: WorkspaceSetup;
  data: WorkspaceData;
}
