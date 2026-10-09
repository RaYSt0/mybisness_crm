import { useStudents } from "../../state/students-context";
import { paymentRecords } from "../../data/demo-records";
import { Link } from "react-router";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export function FinanceView({ enabled }: { enabled: boolean }) {
  const { students } = useStudents();
  const student = students.find((item) => item.id === "1");
  if (!enabled)
    return (
      <section className="p-6 space-y-4">
        <h2 className="text-2xl">Финансы</h2>
        <p>
          Финансовый модуль выключен. Включите его на втором шаге конструктора.
        </p>
        <Button asChild>
          <Link to="/constructor">Открыть конструктор</Link>
        </Button>
      </section>
    );
  return (
    <section className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl">Финансы</h2>
        <p className="text-muted-foreground mt-1">
          Пример истории платежей за абонемент.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            Платежи: {student?.name ?? "демонстрационный ученик"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <caption className="sr-only">
                Демонстрационная история платежей
              </caption>
              <thead>
                <tr>
                  <th className="p-3">Дата</th>
                  <th className="p-3">Сумма</th>
                  <th className="p-3">Статус</th>
                </tr>
              </thead>
              <tbody>
                {paymentRecords.map(({ date, amount, status }) => (
                  <tr key={date} className="border-t border-border">
                    <td className="p-3 whitespace-nowrap">{date}</td>
                    <td className="p-3 whitespace-nowrap">{amount}</td>
                    <td className="p-3">{status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button variant="outline" asChild className="mt-4">
            <Link to="/students/1">Карточка ученика</Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
