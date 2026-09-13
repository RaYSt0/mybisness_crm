import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { type StudentDetails } from "../../data/students";
import { useStudents } from "../../state/students-context";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent } from "../ui/card";

const EMPTY_DETAILS: StudentDetails = {
  name: "",
  group: "",
  guardian: "",
  phone: "",
  email: "",
  birthDate: "",
  notes: "",
};

export function StudentFormView({ editing = false }: { editing?: boolean }) {
  const { studentId } = useParams();
  const { students, addStudent, updateStudent } = useStudents();
  const student = students.find((item) => item.id === studentId);
  const navigate = useNavigate();
  const [details, setDetails] = useState<StudentDetails>(
    student ?? EMPTY_DETAILS,
  );
  const [error, setError] = useState("");
  const backTo = editing ? `/students/${studentId}` : "/students";

  if (editing && !student)
    return (
      <div className="p-6 space-y-4">
        <h2 className="text-2xl">Ученик не найден</h2>
        <Link to="/students" className="text-primary">
          Вернуться к ученикам
        </Link>
      </div>
    );

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleaned: StudentDetails = {
      name: details.name.trim(),
      group: details.group.trim(),
      guardian: details.guardian.trim(),
      phone: details.phone.trim(),
      email: details.email.trim(),
      birthDate: details.birthDate,
      notes: details.notes.trim(),
    };
    if (!cleaned.name || !cleaned.group) {
      setError(
        "Укажите имя ученика и группу. Поля не могут состоять только из пробелов.",
      );
      return;
    }
    const today = new Date().toLocaleDateString("sv-SE");
    if (cleaned.birthDate && cleaned.birthDate > today) {
      setError("Дата рождения не может быть в будущем.");
      return;
    }
    const id = editing ? student!.id : addStudent(cleaned);
    if (editing) updateStudent(id, cleaned);
    navigate(`/students/${id}`);
  }

  const fields = [
    {
      key: "name",
      label: "Имя ученика",
      required: true,
      type: "text",
      maxLength: 100,
    },
    {
      key: "group",
      label: "Группа",
      required: true,
      type: "text",
      maxLength: 100,
    },
    {
      key: "guardian",
      label: "Родитель / опекун",
      type: "text",
      maxLength: 100,
    },
    { key: "phone", label: "Телефон", type: "tel", maxLength: 30 },
    { key: "email", label: "Email", type: "email", maxLength: 254 },
    { key: "birthDate", label: "Дата рождения", type: "date" },
  ] as const;

  return (
    <section className="p-6 space-y-6 max-w-4xl">
      <h2 className="text-2xl">
        {editing ? "Редактировать ученика" : "Добавить ученика"}
      </h2>
      <p className="text-muted-foreground">
        Имя и группа обязательны. Данные сохраняются в этом браузере.
      </p>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={submit} className="space-y-6">
            {error && (
              <p role="alert" className="text-destructive">
                {error}
              </p>
            )}
            <div className="grid gap-5 md:grid-cols-2">
              {fields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <label htmlFor={field.key}>
                    {field.label}
                    {"required" in field && field.required ? " *" : ""}
                  </label>
                  <Input
                    id={field.key}
                    name={field.key}
                    type={field.type}
                    required={"required" in field && field.required}
                    maxLength={
                      "maxLength" in field ? field.maxLength : undefined
                    }
                    value={details[field.key]}
                    onChange={(event) => {
                      setDetails({
                        ...details,
                        [field.key]: event.target.value,
                      });
                      setError("");
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <label htmlFor="notes">Заметки</label>
              <textarea
                id="notes"
                maxLength={2000}
                rows={4}
                value={details.notes}
                onChange={(event) =>
                  setDetails({ ...details, notes: event.target.value })
                }
                className="block w-full rounded-md border border-border p-3"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="submit">Сохранить ученика</Button>
              <Button variant="outline" asChild>
                <Link to={backTo}>Отмена</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
