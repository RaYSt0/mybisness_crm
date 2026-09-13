import { Link } from 'react-router';
import { AlertCircle, DollarSign, TrendingUp, Users } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BusinessConfig } from '../../config/business-config';

interface DashboardViewProps {
  config: BusinessConfig;
}

const revenueData = [
  { month: 'Янв', value: 1800000 },
  { month: 'Фев', value: 2100000 },
  { month: 'Мар', value: 2400000 },
  { month: 'Апр', value: 2625000 },
  { month: 'Май', value: 2850000 },
];

const attendanceData = [
  { name: 'Присутствует', value: 85, color: '#10b981' },
  { name: 'Отсутствует', value: 10, color: '#ef4444' },
  { name: 'По уважительной', value: 5, color: '#f59e0b' },
];

const alerts = [
  {
    id: 1,
    type: 'warning',
    title: 'Абонементы подходят к концу',
    message: 'У 5 клиентов осталось менее 2 занятий. Рекомендуем отправить автосообщение о продлении.',
    action: 'Открыть карточку ученика',
  },
  {
    id: 2,
    type: 'alert',
    title: 'Риск оттока ученика',
    message: 'Иван пропустил 3 занятия подряд. Стоит связаться с родителем и уточнить причину.',
    action: 'Открыть карточку ученика',
  },
  {
    id: 3,
    type: 'info',
    title: 'План платежей на неделю',
    message: 'Ожидается 12 платежей. Можно включить напоминания и собрать выручку раньше.',
    action: 'Открыть финансы',
  },
];

export function DashboardView({ config }: DashboardViewProps) {
  const hasFinance = config.enabledModules.includes('finance');
  const hasScheduling = config.enabledModules.includes('scheduling');

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl">Главная</h2>
        <p className="text-muted-foreground mt-1">Сначала важные действия, затем аналитика.</p>
      </div>

      <div className="bg-card rounded-lg border border-border p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-[#f59e0b]" />
          <h3 className="text-lg">Приоритет: важные уведомления и советы</h3>
        </div>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className="dashboard-alert flex items-start justify-between p-4 bg-accent/50 rounded-lg border border-border gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      alert.type === 'warning' ? 'bg-[#f59e0b]' : alert.type === 'alert' ? 'bg-[#ef4444]' : 'bg-[#2563eb]'
                    }`}
                  ></div>
                  <p>{alert.title}</p>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
              </div>
              <Link to={alert.id === 3 ? "/finance" : "/students/1"} className="shrink-0 px-4 py-1.5 text-sm text-primary border border-primary rounded-md hover:bg-primary hover:text-primary-foreground transition-colors">
                {alert.action}
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-card rounded-lg border border-border p-6">
          <h4 className="text-sm text-muted-foreground mb-2">Всего учеников</h4>
          <p className="text-2xl">234</p>
          <p className="text-xs text-[#10b981] mt-1">+8 в этом месяце</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-6">
          <h4 className="text-sm text-muted-foreground mb-2">Активных групп</h4>
          <p className="text-2xl">18</p>
          <p className="text-xs text-muted-foreground mt-1">5 направлений</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-6">
          <h4 className="text-sm text-muted-foreground mb-2">Сотрудников</h4>
          <p className="text-2xl">12</p>
          <p className="text-xs text-muted-foreground mt-1">8 тренеров, 4 админ.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {hasFinance && (
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Выручка за месяц</p>
                <h3 className="text-3xl mt-1">2 850 000 ₽</h3>
                <div className="flex items-center gap-2 mt-2">
                  <TrendingUp className="w-4 h-4 text-[#10b981]" />
                  <span className="text-sm text-[#10b981]">+12% к прошлому месяцу</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#2563eb]/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-[#2563eb]" />
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '12px' }} />
                <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                <Tooltip />
                <Area isAnimationActive={false} type="monotone" dataKey="value" stroke="#2563eb" fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {hasScheduling && (
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Посещаемость сегодня</p>
                <h3 className="text-3xl mt-1">85%</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#10b981]/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-[#10b981]" />
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie isAnimationActive={false} data={attendanceData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                  {attendanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="chart-legend flex justify-center gap-4 mt-4">
              {attendanceData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-xs text-muted-foreground">
                    {item.name} ({item.value}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
