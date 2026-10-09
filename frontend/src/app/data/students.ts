export interface Student {
  id: string;
  name: string;
  group: string;
  guardian: string;
  phone: string;
  email: string;
  birthDate: string;
  notes: string;
  archived: boolean;
}

export type StudentDetails = Omit<Student, "id" | "archived">;

export const INITIAL_STUDENTS: Student[] = [
  {
    id: "1",
    name: "Иван Иванов",
    group: "Группа А — Продвинутый балет",
    guardian: "Сергей Иванов",
    phone: "+7 (999) 123-45-67",
    email: "s.ivanov@example.com",
    birthDate: "2015-03-15",
    notes: "Демонстрационная карточка ученика.",
    archived: false,
  },
];

export const STUDENTS_STORAGE_KEY = "mybusiness:students:v1";

export function isStudent(value: unknown): value is Student {
  if (!value || typeof value !== "object") return false;
  const student = value as Record<string, unknown>;
  return (
    [
      "id",
      "name",
      "group",
      "guardian",
      "phone",
      "email",
      "birthDate",
      "notes",
    ].every((key) => typeof student[key] === "string") &&
    Boolean((student.id as string).trim()) &&
    Boolean((student.name as string).trim()) &&
    Boolean((student.group as string).trim()) &&
    typeof student.archived === "boolean"
  );
}
