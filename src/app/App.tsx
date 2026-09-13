import { StudentsProvider, useStudents } from "./state/students-context";
import { StudentsView } from "./components/views/students-view";
import { StudentFormView } from "./components/views/student-form-view";
import { BrowserRouter, Link, Route, Routes } from "react-router";
import { Header } from "./components/layout/header";
import { Sidebar } from "./components/layout/sidebar";
import { DashboardView } from "./components/views/dashboard-view";
import { ConfigConstructorView } from "./components/views/config-constructor-view";
import { StudentProfileView } from "./components/views/student-profile-view";
import { SettingsView } from "./components/views/settings-view";
import { FinanceView } from "./components/views/finance-view";
import { HelpView } from "./components/views/help-view";
import { Button } from "./components/ui/button";
import { useBusinessConfig } from "./state/use-business-config";

function Workspace() {
  const { storageWarning } = useStudents();
  const { config, setConfig } = useBusinessConfig();
  return (
    <>
      <div className="app-shell bg-background">
        <Header />
        <div className="app-body">
          <Sidebar config={config} />
          <main id="main-content" className="min-w-0 flex-1">
            {storageWarning && (
              <p
                role="alert"
                className="m-4 rounded-lg border border-border bg-accent p-4"
              >
                {storageWarning}
              </p>
            )}
            <Routes>
              <Route path="/" element={<DashboardView config={config} />} />
              <Route path="/students" element={<StudentsView />} />
              <Route
                path="/students/new"
                element={<StudentFormView key="new" />}
              />
              <Route
                path="/students/:studentId/edit"
                element={<StudentFormView key="edit" editing />}
              />
              <Route
                path="/students/:studentId"
                element={<StudentProfileView config={config} />}
              />
              <Route path="/settings" element={<SettingsView />} />
              <Route
                path="/constructor"
                element={
                  <ConfigConstructorView
                    config={config}
                    onConfigChange={setConfig}
                  />
                }
              />
              <Route
                path="/finance"
                element={
                  <FinanceView
                    enabled={config.enabledModules.includes("finance")}
                  />
                }
              />
              <Route path="/help" element={<HelpView />} />
              <Route
                path="*"
                element={
                  <div className="p-6 space-y-4">
                    <h2 className="text-2xl">Страница не найдена</h2>
                    <p>Проверьте адрес или вернитесь на главную.</p>
                    <Button asChild>
                      <Link to="/">На главную</Link>
                    </Button>
                  </div>
                }
              />
            </Routes>
          </main>
        </div>
        <footer className="border-t border-border p-3 text-center text-xs text-muted-foreground">
          МойБизнес CRM · Учебный прототип · Демонстрационные данные
        </footer>
      </div>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <StudentsProvider>
        <Workspace />
      </StudentsProvider>
    </BrowserRouter>
  );
}
