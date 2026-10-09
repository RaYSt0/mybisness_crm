import { useMemo, useState } from 'react';
import { Edit2, Shield, Trash2, Users } from 'lucide-react';
import { Link } from 'react-router';
import { BusinessConfig, RBAC_PERMISSIONS, ROLE_LABELS, UserRole } from '../../config/business-config';
import { Button } from '../ui/button';

const employees = [
  { id: 1, name: 'Иван Смирнов', email: 'ivan@mybusiness.ru', role: 'admin' as UserRole, status: 'Активен' },
  { id: 2, name: 'Мария Петрова', email: 'maria@mybusiness.ru', role: 'coach' as UserRole, status: 'Активна' },
  { id: 3, name: 'Дмитрий Соколов', email: 'dmitriy@mybusiness.ru', role: 'coach' as UserRole, status: 'Активен' },
  { id: 4, name: 'Анна Волкова', email: 'anna@mybusiness.ru', role: 'admin' as UserRole, status: 'Активна' },
  { id: 5, name: 'Михаил Новиков', email: 'mikhail@mybusiness.ru', role: 'coach' as UserRole, status: 'Неактивен' },
];

const roles: UserRole[] = ['owner', 'admin', 'coach'];

export function SettingsView({ config }: { config: BusinessConfig }) {
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const [showPermissions, setShowPermissions] = useState(false);

  const selectedUser = useMemo(() => employees.find((employee) => employee.id === selectedEmployee), [selectedEmployee]);

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl">Команда и права доступа</h2>
          <p className="text-muted-foreground mt-1">{config.organizationName} · RBAC-модель: Владелец, Админ, Тренер</p>
        </div>
        <Button variant="outline" asChild><Link to="#">Изменить модули CRM</Link></Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-lg border border-border overflow-hidden">
          <div className="team-heading p-4 border-b border-border flex items-center justify-between gap-3">
            <h3 className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5" />
              Члены команды
            </h3>
            <button disabled title="Добавление будет доступно после подключения сервера" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              + Добавить сотрудника
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-accent/30">
                  <th className="text-left py-3 px-4 text-sm text-muted-foreground">Имя</th>
                  <th className="text-left py-3 px-4 text-sm text-muted-foreground">Email</th>
                  <th className="text-left py-3 px-4 text-sm text-muted-foreground">Роль</th>
                  <th className="text-left py-3 px-4 text-sm text-muted-foreground">Статус</th>
                  <th className="text-left py-3 px-4 text-sm text-muted-foreground">Действия</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.id} className="border-b border-border hover:bg-accent transition-colors">
                    <td className="py-3 px-4">{employee.name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{employee.email}</td>
                    <td className="py-3 px-4">
                      <span className="px-3 py-1 bg-accent rounded-full text-sm">{ROLE_LABELS[employee.role]}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs ${
                          employee.status.includes('Актив') ? 'bg-[#10b981]/10 text-[#10b981]' : 'bg-[#64748b]/10 text-[#64748b]'
                        }`}
                      >
                        {employee.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          aria-label={`Просмотреть права: ${employee.name}`}
                          onClick={() => {
                            setSelectedEmployee(employee.id);
                            setShowPermissions(true);
                          }}
                          className="p-2 hover:bg-accent rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button disabled aria-label={`Удалить ${employee.name} (недоступно в прототипе)`} className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5" />
            Роли и права
          </h3>

          {showPermissions ? (
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                Просмотр прав для: <span className="text-foreground">{selectedUser?.name}</span>
              </p>

              <div className="space-y-2">
                {RBAC_PERMISSIONS.filter(permission => selectedUser && permission[selectedUser.role]).map((permission) => (
                  <div key={permission.key} className="p-3 bg-accent rounded-lg border border-border">
                    <p className="text-sm">{permission.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {roles
                        .filter((role) => permission[role])
                        .map((role) => ROLE_LABELS[role])
                        .join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Выберите сотрудника для просмотра прав</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 bg-card rounded-lg border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="text-lg">Матрица прав доступа</h3>
          <p className="text-sm text-muted-foreground mt-1">Демонстрационная матрица ролей сотрудников</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-accent/30">
                <th className="text-left py-3 px-4 text-sm text-muted-foreground sticky left-0 bg-accent/30">Право</th>
                {roles.map((role) => (
                  <th key={role} className="text-center py-3 px-4 text-sm text-muted-foreground">
                    {ROLE_LABELS[role]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RBAC_PERMISSIONS.map((permission) => (
                <tr key={permission.key} className="border-b border-border hover:bg-accent">
                  <td className="py-3 px-4 sticky left-0 bg-card">{permission.label}</td>
                  {roles.map((role) => (
                    <td key={role} className="py-3 px-4 text-center">
                      <input type="checkbox" checked={permission[role]} readOnly className="w-4 h-4 rounded border-border" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
