import { BrowserRouter, Link, Route, Routes } from 'react-router';
import { Header } from './components/layout/header';
import { Sidebar } from './components/layout/sidebar';
import { DashboardView } from './components/views/dashboard-view';
import { ConfigConstructorView } from './components/views/config-constructor-view';
import { StudentProfileView } from './components/views/student-profile-view';
import { SettingsView } from './components/views/settings-view';
import { StudentsView, FinanceView, HelpView } from './components/views/directory-views';
import { Button } from './components/ui/button';
import { useBusinessConfig } from './state/use-business-config';

export default function App() {
  const { config, setConfig } = useBusinessConfig();
  return (
    <BrowserRouter>
      <div className="app-shell bg-background">
        <Header />
        <div className="app-body">
          <Sidebar config={config} />
          <main id="main-content" className="min-w-0 flex-1">
            <Routes>
              <Route path="/" element={<DashboardView config={config} />} />
              <Route path="/students" element={<StudentsView />} />
              <Route path="/students/1" element={<StudentProfileView config={config} />} />
              <Route path="/settings" element={<SettingsView />} />
              <Route path="/constructor" element={<ConfigConstructorView config={config} onConfigChange={setConfig} />} />
              <Route path="/finance" element={<FinanceView enabled={config.enabledModules.includes('finance')} />} />
              <Route path="/help" element={<HelpView />} />
              <Route path="*" element={<div className="p-6 space-y-4"><h2 className="text-2xl">Страница не найдена</h2><p>Проверьте адрес или вернитесь на главную.</p><Button asChild><Link to="/">На главную</Link></Button></div>} />
            </Routes>
          </main>
        </div>
        <footer className="border-t border-border p-3 text-center text-xs text-muted-foreground">МойБизнес CRM · Учебный прототип · Демонстрационные данные</footer>
      </div>
    </BrowserRouter>
  );
}
