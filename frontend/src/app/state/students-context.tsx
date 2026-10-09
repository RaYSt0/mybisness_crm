import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  INITIAL_STUDENTS,
  STUDENTS_STORAGE_KEY,
  isStudent,
  type Student,
  type StudentDetails,
} from "../data/students";
import { STORAGE_KEYS } from "../config/business-config";
import { archiveStudent as apiArchiveStudent, createStudent as apiCreateStudent, isApiEnabled, listStudents, updateStudent as apiUpdateStudent } from "../api/client";

function getOrganizationId(): number | null {
  try {
    const value = localStorage.getItem(STORAGE_KEYS.businessConfig);
    if (!value) return null;
    const id = (JSON.parse(value) as { organizationId?: unknown }).organizationId;
    return typeof id === "number" ? id : null;
  } catch {
    return null;
  }
}

function readStudents(): { students: Student[]; storageWarning: string } {
  try {
    const raw = localStorage.getItem(STUDENTS_STORAGE_KEY);
    if (!raw) return { students: INITIAL_STUDENTS, storageWarning: "" };
    const parsed: unknown = JSON.parse(raw);
    if (
      !Array.isArray(parsed) ||
      !parsed.every(isStudent) ||
      new Set(parsed.map((student) => student.id)).size !== parsed.length
    ) {
      throw new Error("Invalid students data");
    }
    return { students: parsed, storageWarning: "" };
  } catch {
    return {
      students: INITIAL_STUDENTS,
      storageWarning:
        "Не удалось прочитать сохранённых учеников. Показан демонстрационный список. Сохранение изменений заменит данные учеников в этом браузере.",
    };
  }
}

interface StudentsContextValue {
  students: Student[];
  storageWarning: string;
  addStudent: (details: StudentDetails) => Promise<string>;
  updateStudent: (id: string, details: StudentDetails) => Promise<void>;
  setArchived: (id: string, archived: boolean) => Promise<void>;
}

const StudentsContext = createContext<StudentsContextValue | null>(null);

export function StudentsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(readStudents);
  const [apiWarning, setApiWarning] = useState("");

  useEffect(() => {
    const organizationId = getOrganizationId();
    if (!isApiEnabled || organizationId === null) return;
    let active = true;
    listStudents(organizationId).then((students) => {
      if (!active) return;
      setState({ students, storageWarning: "" });
      try {
        localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(students));
      } catch {
        setApiWarning("Данные получены с сервера, но кэш браузера сохранить не удалось.");
      }
    }).catch((cause: unknown) => {
      if (active) setApiWarning(cause instanceof Error ? cause.message : "Не удалось загрузить учеников с сервера.");
    });
    return () => { active = false; };
  }, []);

  function save(students: Student[]) {
    let storageWarning = "";
    try {
      localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(students));
    } catch {
      storageWarning =
        "Не удалось сохранить изменения в браузере. Они доступны до перезагрузки страницы.";
    }
    setState({ students, storageWarning });
  }

  async function addStudent(details: StudentDetails) {
    const organizationId = getOrganizationId();
    const student = isApiEnabled && organizationId !== null
      ? await apiCreateStudent(organizationId, details)
      : { ...details, id: crypto.randomUUID(), archived: false };
    setApiWarning("");
    save([...state.students, student]);
    return student.id;
  }

  async function updateStudent(id: string, details: StudentDetails) {
    const organizationId = getOrganizationId();
    const updated = isApiEnabled && organizationId !== null
      ? await apiUpdateStudent(organizationId, id, details)
      : null;
    setApiWarning("");
    save(state.students.map((student) => student.id === id ? (updated ?? { ...student, ...details }) : student));
  }

  async function setArchived(id: string, archived: boolean) {
    const organizationId = getOrganizationId();
    if (isApiEnabled && organizationId !== null) {
      try {
        await apiArchiveStudent(organizationId, id, archived);
      } catch (cause) {
        setApiWarning(cause instanceof Error ? cause.message : "Не удалось обновить ученика на сервере.");
        return;
      }
    }
    setApiWarning("");
    save(state.students.map((student) => student.id === id ? { ...student, archived } : student));
  }

  return (
    <StudentsContext.Provider
      value={{ ...state, storageWarning: apiWarning || state.storageWarning, addStudent, updateStudent, setArchived }}
    >
      {children}
    </StudentsContext.Provider>
  );
}

export function useStudents() {
  const context = useContext(StudentsContext);
  if (!context) throw new Error("useStudents requires StudentsProvider");
  return context;
}
