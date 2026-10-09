import { useState } from "react";
import { Link } from "react-router";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useStudents } from "../../state/students-context";

export function StudentsView() {
  const { students } = useStudents();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("active");
  const matches = students.filter((student) => {
    const matchesStatus =
      status === "all" || student.archived === (status === "archived");
    return (
      matchesStatus &&
      `${student.name} ${student.group}`
        .toLocaleLowerCase("ru")
        .includes(query.trim().toLocaleLowerCase("ru"))
    );
  });

  return (
    <section className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl">Ученики</h2>
          <p className="text-muted-foreground mt-1">
            Найдите ученика или добавьте новую карточку.
          </p>
        </div>
        <Button asChild>
          <Link to="/students/new">Добавить ученика</Link>
        </Button>
      </div>
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-0 max-w-lg space-y-2">
          <label htmlFor="student-search">Поиск по имени или группе</label>
          <Input
            id="student-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Например, Иван"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="student-status" className="block">
            Статус
          </label>
          <select
            id="student-status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-9 rounded-md border border-border bg-card px-3"
          >
            <option value="active">Активные</option>
            <option value="archived">В архиве</option>
            <option value="all">Все</option>
          </select>
        </div>
      </div>
      <p role="status" className="text-sm text-muted-foreground">
        Найдено учеников: {matches.length}
      </p>
      <div className="grid gap-4 lg:grid-cols-2">
        {matches.map((student) => (
          <Card key={student.id}>
            <CardHeader>
              <CardTitle>{student.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>{student.group}</p>
              <p className="text-muted-foreground">
                {student.archived ? "В архиве" : "Активный ученик"}
              </p>
              <Button asChild>
                <Link to={`/students/${student.id}`}>Открыть карточку</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      {matches.length === 0 && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <p>
              Ученики не найдены. Измените поиск или статус, либо добавьте
              ученика.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setQuery("");
                setStatus("active");
              }}
            >
              Сбросить поиск
            </Button>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
