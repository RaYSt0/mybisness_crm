import { NavLink } from 'react-router';
import { LayoutDashboard, Users, Wallet, Settings, HelpCircle } from 'lucide-react';
import { BusinessConfig } from '../../config/business-config';

export function Sidebar({ config }: { config: BusinessConfig }) {
  const menuItems = [
    { to: '/', icon: LayoutDashboard, label: 'Главная' },
    { to: '/students', icon: Users, label: 'Ученики' },
    ...(config.enabledModules.includes('finance') ? [{ to: '/finance', icon: Wallet, label: 'Финансы' }] : []),
    { to: '/settings', icon: Settings, label: 'Настройки' },
    { to: '/help', icon: HelpCircle, label: 'Помощь' },
  ];
  return (
    <aside className="app-sidebar bg-sidebar border-r border-sidebar-border">
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-xl text-primary">{config.organizationName}</h1>
        <p className="text-xs text-muted-foreground mt-1">{config.ownerName} · владелец</p>
      </div>
      <nav aria-label="Основная навигация" className="p-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent'}`}>
            <item.icon className="w-5 h-5 shrink-0" /><span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
