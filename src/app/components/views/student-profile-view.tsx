import { Link, useParams } from "react-router";
import { useState } from "react";
import { BusinessConfig } from "../../config/business-config";
import { useStudents } from "../../state/students-context";
import { attendanceRecords, paymentRecords } from "../../data/demo-records";
import { Button } from "../ui/button";

export function StudentProfileView({ config }: { config: BusinessConfig }) {
  const { studentId } = useParams();
  const { students, setArchived } = useStudents();
  const student = students.find((item) => item.id === studentId);
  const [selectedTab, setSelectedTab] = useState("Информация");
  const tabs = [
    "Информация",
    ...(config.enabledModules.includes("scheduling") ? ["Посещаемость"] : []),
    ...(config.enabledModules.includes("subscriptions") ? ["Платежи"] : []),
    ...(config.enabledModules.includes("medical") ? ["Документы"] : []),
  ];
  const activeTab = tabs.includes(selectedTab) ? selectedTab : "Информация";

  if (!student)
    return (
      <section className="p-6 space-y-4">
        <h2 className="text-2xl">Ученик не найден</h2>
        <Button asChild>
          <Link to="/students">Все ученики</Link>
        </Button>
      </section>
    );

  const isDemo = student.id === "1";
  const initials = student.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
  const details = [
    ["Полное имя", student.name],
    ["Группа", student.group],
    [
      "Дата рождения",
      student.birthDate
        ? student.birthDate.split("-").reverse().join(".")
        : "Не указана",
    ],
    ["Родитель / опекун", student.guardian || "Не указан"],
    ["Телефон", student.phone || "Не указан"],
    ["Email", student.email || "Не указан"],
  ];

  return (
    <section className="p-6 space-y-4">
      <Link
        to="/students"
        className="inline-block text-primary hover:underline"
      >
        ← Все ученики
      </Link>
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="bg-gradient-to-r from-[#2563eb] to-[#3b82f6] p-8 text-white">
          <div className="profile-heading flex items-center gap-6">
            <div className="w-24 h-24 shrink-0 rounded-full bg-white/20 flex items-center justify-center text-3xl">
              {initials}
            </div>
            <div className="min-w-0">
              <h2 className="text-3xl mb-2">{student.name}</h2>
              <p>{student.group}</p>
              <p className="mt-2 text-sm">
                {student.archived ? "В архиве" : "Активный ученик"}
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 flex flex-wrap gap-3 border-b border-border">
          <Button asChild variant="outline">
            <Link to={`/students/${student.id}/edit`}>Редактировать</Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => setArchived(student.id, !student.archived)}
          >
            {student.archived ? "Восстановить ученика" : "В архив"}
          </Button>
        </div>
        <div className="profile-tabs flex border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab}
              aria-pressed={activeTab === tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-6 py-4 border-b-2 ${activeTab === tab ? "text-primary border-primary" : "text-muted-foreground border-transparent"}`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="p-6">
          {activeTab === "Информация" && (
            <div className="space-y-6">
              <h3 className="text-lg">Персональная информация</h3>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {details.map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-sm text-muted-foreground">{label}</dt>
                    <dd className="mt-1 break-words">{value}</dd>
                  </div>
                ))}
              </dl>
              <div>
                <h3 className="text-lg mb-2">Заметки</h3>
                <p className="whitespace-pre-wrap break-words">
                  {student.notes || "Заметок пока нет."}
                </p>
              </div>
              {student.archived && (
                <p className="text-muted-foreground">
                  Карточка сохранена в архиве. Восстановите ученика, чтобы
                  вернуть его в активный список.
                </p>
              )}
            </div>
          )}
          {activeTab === "Посещаемость" && (
            <div className="space-y-4">
              <h3 className="text-lg">История посещений</h3>
              {isDemo ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr>
                        <th className="p-3">Дата</th>
                        <th className="p-3">Статус</th>
                        <th className="p-3">Время</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceRecords.map((record) => (
                        <tr
                          key={record.date}
                          className="border-t border-border"
                        >
                          <td className="p-3">{record.date}</td>
                          <td className="p-3">{record.status}</td>
                          <td className="p-3">{record.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>
                  Посещений пока нет. Учёт занятий появится на следующем этапе.
                </p>
              )}
            </div>
          )}
          {activeTab === "Платежи" && (
            <div className="space-y-4">
              <h3 className="text-lg">История платежей</h3>
              {isDemo ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr>
                        <th className="p-3">Дата</th>
                        <th className="p-3">Сумма</th>
                        <th className="p-3">Статус</th>
                        <th className="p-3">Метод</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentRecords.map((record) => (
                        <tr
                          key={record.date}
                          className="border-t border-border"
                        >
                          <td className="p-3">{record.date}</td>
                          <td className="p-3 whitespace-nowrap">
                            {record.amount}
                          </td>
                          <td className="p-3">{record.status}</td>
                          <td className="p-3">{record.method}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>Платежей пока нет. Приём оплаты в прототипе недоступен.</p>
              )}
            </div>
          )}
          {activeTab === "Документы" && (
            <div className="space-y-4">
              <h3 className="text-lg">Документы</h3>
              {isDemo ? (
                [
                  "Форма зачисления",
                  "Медицинская справка",
                  "Разрешение на фото",
                ].map((name) => (
                  <div
                    key={name}
                    className="flex flex-wrap justify-between gap-3 p-4 border border-border rounded-lg"
                  >
                    <span>{name}</span>
                    <span className="text-muted-foreground">Демо</span>
                  </div>
                ))
              ) : (
                <p>Документов пока нет.</p>
              )}
              <p className="text-sm text-muted-foreground">
                Загрузка файлов появится при подключении сервера.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
