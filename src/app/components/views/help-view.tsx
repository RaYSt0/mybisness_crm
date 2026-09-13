import { Link } from "react-router";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export function HelpView() {
  return (
    <section className="p-6 space-y-6">
      <h2 className="text-2xl">Помощь</h2>
      <Card>
        <CardHeader>
          <CardTitle>Начало работы</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal pl-5 space-y-3">
            <li>
              В конструкторе выберите тип бизнеса и включите нужные модули.
            </li>
            <li>
              В разделе «Ученики» найдите ученика и откройте информацию,
              посещаемость и платежи.
            </li>
            <li>
              В разделе «Настройки» выберите сотрудника для просмотра прав его
              роли.
            </li>
            <li>В разделе «Финансы» просмотрите пример платежей.</li>
          </ol>
          <Button asChild>
            <Link to="/constructor">Настроить CRM</Link>
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Возможности прототипа</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Данные демонстрационные. Настройка модулей сохраняется в этом
            браузере. Ученики добавляются и редактируются локально, их можно
            архивировать и восстановить. Оплата, загрузка документов и
            управление сотрудниками появятся при подключении сервера.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
