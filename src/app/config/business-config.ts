import { Dumbbell, GraduationCap, HeartPulse, IdCard, Music, Wallet } from 'lucide-react';

export type BusinessPresetId = 'dance' | 'sports' | 'tutoring';
export type BusinessModuleId = 'subscriptions' | 'medical' | 'scheduling' | 'finance';
export type UserRole = 'owner' | 'admin' | 'coach';

export interface BusinessPreset {
  id: BusinessPresetId;
  name: string;
  description: string;
  icon: typeof Music;
}

export interface ModuleDefinition {
  id: BusinessModuleId;
  name: string;
  description: string;
  icon: typeof Music;
  defaultEnabled: boolean;
}

export interface BusinessConfig {
  organizationName: string;
  ownerName: string;
  ownerEmail: string;
  presetId: BusinessPresetId;
  enabledModules: BusinessModuleId[];
  isOnboardingCompleted: boolean;
}

export const BUSINESS_PRESETS: BusinessPreset[] = [
  {
    id: 'dance',
    icon: Music,
    name: 'Школа танцев',
    description: 'Подходит для студий танца и хореографических классов.',
  },
  {
    id: 'sports',
    icon: Dumbbell,
    name: 'Спортивная секция',
    description: 'Для бокса, фитнеса, борьбы и других секционных тренировок.',
  },
  {
    id: 'tutoring',
    icon: GraduationCap,
    name: 'Учебный центр',
    description: 'Для репетиторских и образовательных программ.',
  },
];

export const MODULE_DEFINITIONS: ModuleDefinition[] = [
  {
    id: 'subscriptions',
    name: 'Абонементы',
    description: 'Планы занятий, остатки, продления и заморозки.',
    icon: IdCard,
    defaultEnabled: true,
  },
  {
    id: 'medical',
    name: 'Мед-карты',
    description: 'Медицинские данные, ограничения и справки.',
    icon: HeartPulse,
    defaultEnabled: false,
  },
  {
    id: 'scheduling',
    name: 'Расписание',
    description: 'Календарь занятий, группы и переносы.',
    icon: GraduationCap,
    defaultEnabled: true,
  },
  {
    id: 'finance',
    name: 'Финансы',
    description: 'Выручка, задолженности и отчеты.',
    icon: Wallet,
    defaultEnabled: true,
  },
];

export const DEFAULT_BUSINESS_CONFIG: BusinessConfig = {
  organizationName: '',
  ownerName: '',
  ownerEmail: '',
  presetId: 'dance',
  enabledModules: MODULE_DEFINITIONS.filter((module) => module.defaultEnabled).map((module) => module.id),
  isOnboardingCompleted: false,
};

export const STORAGE_KEYS = {
  businessConfig: 'mybusiness:business-config:v2',
} as const;

export const MODULE_LABELS: Record<BusinessModuleId, string> = {
  subscriptions: 'Абонементы',
  medical: 'Мед-карты',
  scheduling: 'Расписание',
  finance: 'Финансы',
};

export interface RolePermission {
  key: string;
  label: string;
  owner: boolean;
  admin: boolean;
  coach: boolean;
}

export const RBAC_PERMISSIONS: RolePermission[] = [
  { key: 'finance.view', label: 'Просмотр финансов', owner: true, admin: true, coach: false },
  { key: 'finance.edit', label: 'Редактирование финансов', owner: true, admin: true, coach: false },
  { key: 'students.view', label: 'Просмотр учеников', owner: true, admin: true, coach: true },
  { key: 'students.edit', label: 'Редактирование учеников', owner: true, admin: true, coach: false },
  { key: 'attendance.mark', label: 'Отметка посещаемости', owner: true, admin: true, coach: true },
  { key: 'schedule.manage', label: 'Управление расписанием', owner: true, admin: true, coach: true },
  { key: 'team.manage', label: 'Управление командой', owner: true, admin: true, coach: false },
];

export const ROLE_LABELS: Record<UserRole, string> = {
  owner: 'Владелец',
  admin: 'Администратор',
  coach: 'Тренер',
};
