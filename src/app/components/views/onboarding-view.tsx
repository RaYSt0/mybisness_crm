import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { Check, ChevronLeft, ChevronRight, UserRound } from 'lucide-react';
import {
  BUSINESS_PRESETS,
  type BusinessConfig,
  MODULE_DEFINITIONS,
} from '../../config/business-config';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';

interface OnboardingViewProps {
  config: BusinessConfig;
  onConfigChange: (config: BusinessConfig) => void;
}

export function OnboardingView({ config, onConfigChange }: OnboardingViewProps) {
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const update = (patch: Partial<BusinessConfig>) => {
    setError('');
    onConfigChange({ ...config, ...patch });
  };

  const toggleModule = (id: (typeof MODULE_DEFINITIONS)[number]['id']) => {
    const enabledModules = config.enabledModules.includes(id)
      ? config.enabledModules.filter((moduleId) => moduleId !== id)
      : [...config.enabledModules, id];
    update({ enabledModules });
  };

  const continueSetup = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step === 1) {
      if (!config.ownerName.trim() || !config.ownerEmail.trim()) {
        setError('Укажите имя и email владельца.');
        return;
      }
      if (!/^\S+@\S+\.\S+$/.test(config.ownerEmail.trim())) {
        setError('Укажите корректный email владельца.');
        return;
      }
    }
    if (step === 2 && !config.organizationName.trim()) {
      setError('Придумайте название для вашей CRM.');
      return;
    }
    setStep((currentStep) => Math.min(4, currentStep + 1));
  };

  const completeSetup = () => {
    if (!config.organizationName.trim() || !config.ownerName.trim() || !config.ownerEmail.trim()) {
      setError('Вернитесь к анкете и заполните обязательные поля.');
      return;
    }
    onConfigChange({
      ...config,
      organizationName: config.organizationName.trim(),
      ownerName: config.ownerName.trim(),
      ownerEmail: config.ownerEmail.trim(),
      isOnboardingCompleted: true,
    });
    navigate('/');
  };

  return (
    <main className="min-h-dvh bg-background px-4 py-8 sm:px-6">
      <section className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <UserRound aria-hidden="true" />
          </div>
          <h1 className="text-3xl">Создайте свою CRM</h1>
          <p className="mt-2 text-muted-foreground">Сначала короткая регистрация, затем настроим рабочее пространство.</p>
        </div>

        <ol className="mb-8 flex items-center justify-center" aria-label="Этапы настройки">
          {[1, 2, 3, 4].map((item, index) => (
            <li key={item} className="flex items-center">
              <span className={`flex size-9 items-center justify-center rounded-full border-2 text-sm ${step >= item ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground'}`}>
                {step > item ? <Check className="size-4" aria-label={`Этап ${item} завершён`} /> : item}
              </span>
              {index < 3 && <span className={`h-0.5 w-8 sm:w-20 ${step > item ? 'bg-primary' : 'bg-border'}`} />}
            </li>
          ))}
        </ol>

        <form noValidate onSubmit={continueSetup} className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
          {error && <p role="alert" className="mb-5 rounded-md bg-destructive/10 p-3 text-destructive">{error}</p>}

          {step === 1 && (
            <div className="mx-auto max-w-lg space-y-5">
              <div><h2 className="text-xl">1. Регистрация владельца</h2><p className="mt-1 text-muted-foreground">В учебной версии аккаунт создаётся только в этом браузере.</p></div>
              <div className="space-y-2"><label htmlFor="owner-name">Ваше имя *</label><Input id="owner-name" required maxLength={100} value={config.ownerName} onChange={(event) => update({ ownerName: event.target.value })} placeholder="Например, Тимур" /></div>
              <div className="space-y-2"><label htmlFor="owner-email">Email *</label><Input id="owner-email" required type="email" maxLength={254} value={config.ownerEmail} onChange={(event) => update({ ownerEmail: event.target.value })} placeholder="name@example.com" /></div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div><h2 className="text-xl">2. Ваша CRM</h2><p className="mt-1 text-muted-foreground">Название появится в меню, шапке и на главной странице.</p></div>
              <div className="max-w-lg space-y-2"><label htmlFor="organization-name">Название бизнеса *</label><Input id="organization-name" required maxLength={100} value={config.organizationName} onChange={(event) => update({ organizationName: event.target.value })} placeholder="Например, Студия танца «Ритм»" /></div>
              <div className="grid gap-4 md:grid-cols-3">
                {BUSINESS_PRESETS.map((preset) => (
                  <button key={preset.id} type="button" onClick={() => update({ presetId: preset.id })} className={`rounded-lg border-2 p-5 text-left transition-colors ${config.presetId === preset.id ? 'border-primary bg-accent' : 'border-border hover:border-primary/50'}`}>
                    <preset.icon className="mb-3 size-6 text-primary" /><h3>{preset.name}</h3><p className="mt-2 text-sm text-muted-foreground">{preset.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div><h2 className="text-xl">3. Функции CRM</h2><p className="mt-1 text-muted-foreground">Включите то, что увидите в своём рабочем пространстве.</p></div>
              <div className="grid gap-4 md:grid-cols-2">
                {MODULE_DEFINITIONS.map((module) => {
                  const enabled = config.enabledModules.includes(module.id);
                  return <div key={module.id} className={`rounded-lg border-2 p-4 ${enabled ? 'border-primary bg-accent' : 'border-border'}`}><div className="flex items-start justify-between gap-4"><div><h3>{module.name}</h3><p className="mt-1 text-sm text-muted-foreground">{module.description}</p></div><Switch checked={enabled} onCheckedChange={() => toggleModule(module.id)} aria-label={module.name} /></div></div>;
                })}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="mx-auto max-w-lg space-y-5">
              <div><h2 className="text-xl">4. Готово к работе</h2><p className="mt-1 text-muted-foreground">Проверьте данные будущего рабочего пространства.</p></div>
              <dl className="space-y-4 rounded-lg bg-accent p-5"><div><dt className="text-sm text-muted-foreground">Владелец</dt><dd>{config.ownerName} · {config.ownerEmail}</dd></div><div><dt className="text-sm text-muted-foreground">CRM</dt><dd>{config.organizationName}</dd></div><div><dt className="text-sm text-muted-foreground">Тип бизнеса</dt><dd>{BUSINESS_PRESETS.find((preset) => preset.id === config.presetId)?.name}</dd></div><div><dt className="text-sm text-muted-foreground">Модули</dt><dd>{config.enabledModules.length ? config.enabledModules.map((id) => MODULE_DEFINITIONS.find((module) => module.id === id)?.name).join(', ') : 'Не выбраны'}</dd></div></dl>
            </div>
          )}

          <div className="mt-8 flex justify-between border-t border-border pt-6">
            <Button type="button" variant="outline" disabled={step === 1} onClick={() => { setError(''); setStep((currentStep) => Math.max(1, currentStep - 1)); }}><ChevronLeft />Назад</Button>
            {step < 4 ? <Button type="submit">Далее<ChevronRight /></Button> : <Button type="button" onClick={completeSetup}>Открыть CRM<Check /></Button>}
          </div>
        </form>
      </section>
    </main>
  );
}
