import { useState } from 'react';
import { Link } from 'react-router';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export function StudentsView() {
  const [query, setQuery] = useState('');
  const matches = 'Иван Иванов Группа А Продвинутый балет'.toLocaleLowerCase('ru').includes(query.trim().toLocaleLowerCase('ru'));
  return <section className="p-6 space-y-6">
    <div><h2 className="text-2xl">Ученики</h2><p className="text-muted-foreground mt-1">Найдите ученика и откройте его карточку.</p></div>
    <div className="max-w-lg space-y-2"><label htmlFor="student-search">Поиск по имени или группе</label><Input id="student-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Например, Иван" /></div>
    <p role="status" className="text-sm text-muted-foreground">Найдено учеников: {matches ? 1 : 0}</p>
    {matches ? <Card><CardHeader><CardTitle>Иван Иванов</CardTitle></CardHeader><CardContent className="space-y-4"><p>Группа А · Продвинутый балет</p><p className="text-muted-foreground">Осталось 5 из 8 занятий</p><Button asChild><Link to="/students/1">Открыть карточку</Link></Button></CardContent></Card> : <Card><CardContent className="pt-6 space-y-4"><p>Ученики не найдены. Попробуйте другое имя или группу.</p><Button variant="outline" onClick={() => setQuery('')}>Сбросить поиск</Button></CardContent></Card>}
  </section>;
}

export function FinanceView({ enabled }: { enabled: boolean }) {
  if (!enabled) return <section className="p-6 space-y-4"><h2 className="text-2xl">Финансы</h2><p>Финансовый модуль выключен. Включите его на втором шаге конструктора.</p><Button asChild><Link to="/constructor">Открыть конструктор</Link></Button></section>;
  return <section className="p-6 space-y-6"><div><h2 className="text-2xl">Финансы</h2><p className="text-muted-foreground mt-1">Пример истории платежей за абонемент.</p></div>
    <Card><CardHeader><CardTitle>Платежи Ивана Иванова</CardTitle></CardHeader><CardContent><div className="overflow-x-auto"><table className="w-full text-left"><caption className="sr-only">Демонстрационная история платежей</caption><thead><tr><th className="p-3">Дата</th><th className="p-3">Сумма</th><th className="p-3">Статус</th></tr></thead><tbody>{['01.05.2026', '01.04.2026', '01.03.2026'].map(date => <tr key={date} className="border-t border-border"><td className="p-3 whitespace-nowrap">{date}</td><td className="p-3 whitespace-nowrap">18 750 ₽</td><td className="p-3">Оплачено</td></tr>)}</tbody></table></div><Button variant="outline" asChild className="mt-4"><Link to="/students/1">Карточка ученика</Link></Button></CardContent></Card>
  </section>;
}

export function HelpView() {
  return <section className="p-6 space-y-6"><h2 className="text-2xl">Помощь</h2><Card><CardHeader><CardTitle>Начало работы</CardTitle></CardHeader><CardContent className="space-y-4"><ol className="list-decimal pl-5 space-y-3"><li>В конструкторе выберите тип бизнеса и включите нужные модули.</li><li>В разделе «Ученики» найдите ученика и откройте информацию, посещаемость и платежи.</li><li>В разделе «Настройки» выберите сотрудника для просмотра прав его роли.</li><li>В разделе «Финансы» просмотрите пример платежей.</li></ol><Button asChild><Link to="/constructor">Настроить CRM</Link></Button></CardContent></Card><Card><CardHeader><CardTitle>Возможности прототипа</CardTitle></CardHeader><CardContent><p>Данные демонстрационные. Настройка модулей сохраняется в этом браузере. Создание учеников, оплата, загрузка документов и управление сотрудниками появятся при подключении сервера.</p></CardContent></Card></section>;
}
