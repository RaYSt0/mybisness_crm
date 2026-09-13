import { createContext, useContext, useState, type ReactNode } from "react";
import {
  INITIAL_STUDENTS,
  STUDENTS_STORAGE_KEY,
  isStudent,
  type Student,
  type StudentDetails,
} from "../data/students";

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
  addStudent: (details: StudentDetails) => string;
  updateStudent: (id: string, details: StudentDetails) => void;
  setArchived: (id: string, archived: boolean) => void;
}

const StudentsContext = createContext<StudentsContextValue | null>(null);

export function StudentsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(readStudents);

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

  function addStudent(details: StudentDetails) {
    const id = crypto.randomUUID();
    save([...state.students, { ...details, id, archived: false }]);
    return id;
  }

  function updateStudent(id: string, details: StudentDetails) {
    save(
      state.students.map((student) =>
        student.id === id ? { ...student, ...details } : student,
      ),
    );
  }

  function setArchived(id: string, archived: boolean) {
    save(
      state.students.map((student) =>
        student.id === id ? { ...student, archived } : student,
      ),
    );
  }

  return (
    <StudentsContext.Provider
      value={{ ...state, addStudent, updateStudent, setArchived }}
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
