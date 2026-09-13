import { Link } from 'react-router';
import { useState } from 'react';
import { User, Phone, Mail, Calendar, FileText, CreditCard, Clock } from 'lucide-react';
import { BusinessConfig } from '../../config/business-config';

const attendanceRecords = [
  { date: '14.05.2026', status: 'Присутствовал', time: '09:00' },
  { date: '12.05.2026', status: 'Присутствовал', time: '09:00' },
  { date: '10.05.2026', status: 'По уважительной', time: '-' },
  { date: '07.05.2026', status: 'Отсутствовал', time: '-' },
  { date: '05.05.2026', status: 'Присутствовал', time: '09:00' },
];

const paymentRecords = [
  { date: '01.05.2026', amount: '18 750 ₽', status: 'Оплачено', method: 'Банковская карта' },
  { date: '01.04.2026', amount: '18 750 ₽', status: 'Оплачено', method: 'Банковский перевод' },
  { date: '01.03.2026', amount: '18 750 ₽', status: 'Оплачено', method: 'Банковская карта' },
];

interface StudentProfileViewProps {
  config: BusinessConfig;
}

export function StudentProfileView({ config }: StudentProfileViewProps) {
  const [activeTab, setActiveTab] = useState('Информация');
  const hasSubscriptions = config.enabledModules.includes('subscriptions');
  const hasMedical = config.enabledModules.includes('medical');
  const tabs = [
    'Информация',
    'Посещаемость',
    ...(hasSubscriptions ? ['Платежи'] : []),
    ...(hasMedical ? ['Документы'] : []),
  ];

  return (
    <div className="p-6">
      <Link to="/students" className="inline-block text-primary mb-4 hover:underline">← Все ученики</Link>
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="bg-gradient-to-r from-[#2563eb] to-[#3b82f6] p-8 text-white">
          <div className="profile-heading flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-3xl">
              ИИ
            </div>
            <div>
              <h2 className="text-3xl mb-2">Иван Иванов</h2>
              <div className="profile-details flex items-center gap-4 text-white/90">
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Группа А - Продвинутый балет
                </span>
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Зачислен янв. 2025
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-border">
          <div className="profile-tabs flex">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 transition-colors relative ${
                  activeTab === tab
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'Информация' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg mb-4">Персональная информация</h3>
                <div>
                  <label className="text-sm text-muted-foreground">Полное имя</label>
                  <p className="mt-1">Иван Иванов</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Дата рождения</label>
                  <p className="mt-1">15 марта 2015</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Родитель/Опекун</label>
                  <p className="mt-1">Сергей Иванов</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Телефон
                  </label>
                  <p className="mt-1">+7 (999) 123-45-67</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  <p className="mt-1">s.ivanov@email.ru</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg mb-4">Дополнительные поля</h3>
                <div>
                  <label className="text-sm text-muted-foreground">Размер формы</label>
                  <p className="mt-1">Средний</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Экстренный контакт</label>
                  <p className="mt-1">Анна Иванова - +7 (999) 987-65-43</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Медицинские заметки</label>
                  <p className="mt-1">Аллергий не выявлено</p>
                </div>

                <div className="mt-6 p-4 bg-accent rounded-lg border border-border">
                  <h4 className="text-sm mb-3">Статус абонемента</h4>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Осталось занятий</span>
                    <span>5 / 8</span>
                  </div>
                  <div className="w-full bg-border rounded-full h-2">
                    <div className="bg-[#10b981] h-2 rounded-full" style={{ width: '62.5%' }}></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Продление 1 июня 2026</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Посещаемость' && (
            <div>
              <h3 className="text-lg mb-4">История посещений</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm text-muted-foreground">Дата</th>
                      <th className="text-left py-3 px-4 text-sm text-muted-foreground">Статус</th>
                      <th className="text-left py-3 px-4 text-sm text-muted-foreground">Время</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceRecords.map((record, index) => (
                      <tr key={index} className="border-b border-border hover:bg-accent">
                        <td className="py-3 px-4 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {record.date}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs ${
                            record.status === 'Присутствовал' ? 'bg-[#10b981]/10 text-[#10b981]' :
                            record.status === 'Отсутствовал' ? 'bg-[#ef4444]/10 text-[#ef4444]' :
                            'bg-[#f59e0b]/10 text-[#f59e0b]'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 flex items-center gap-2">
                          {record.time !== '-' && <Clock className="w-4 h-4 text-muted-foreground" />}
                          {record.time}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'Платежи' && (
            <div>
              <h3 className="text-lg mb-4">История платежей</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm text-muted-foreground">Дата</th>
                      <th className="text-left py-3 px-4 text-sm text-muted-foreground">Сумма</th>
                      <th className="text-left py-3 px-4 text-sm text-muted-foreground">Статус</th>
                      <th className="text-left py-3 px-4 text-sm text-muted-foreground">Метод</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentRecords.map((payment, index) => (
                      <tr key={index} className="border-b border-border hover:bg-accent">
                        <td className="py-3 px-4">{payment.date}</td>
                        <td className="py-3 px-4">{payment.amount}</td>
                        <td className="py-3 px-4">
                          <span className="px-3 py-1 rounded-full text-xs bg-[#10b981]/10 text-[#10b981]">
                            {payment.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-muted-foreground" />
                          {payment.method}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'Документы' && (
            <div>
              <h3 className="text-lg mb-4">Документы</h3>
              <div className="space-y-3">
                {['Форма зачисления', 'Медицинская справка', 'Разрешение на фото'].map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent transition-colors">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-primary" />
                      <span>{doc}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">Демо</span>
                  </div>
                ))}
                <button disabled title="Загрузка будет доступна после подключения сервера" className="w-full py-3 border-2 border-dashed border-border rounded-lg text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                  + Загрузить документ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
