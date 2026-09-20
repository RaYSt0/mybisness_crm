import { Switch } from '../ui/switch';
import { useState } from 'react';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { BusinessConfig, BUSINESS_PRESETS, MODULE_DEFINITIONS } from '../../config/business-config';

interface ConfigConstructorViewProps {
  config: BusinessConfig;
  onConfigChange: (config: BusinessConfig) => void;
}

export function ConfigConstructorView({ config, onConfigChange }: ConfigConstructorViewProps) {
  const [currentStep, setCurrentStep] = useState(1);

  const toggleModule = (id: (typeof MODULE_DEFINITIONS)[number]['id']) => {
    const enabledModules = config.enabledModules.includes(id)
      ? config.enabledModules.filter((moduleId) => moduleId !== id)
      : [...config.enabledModules, id];

    onConfigChange({ ...config, enabledModules });
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl">Настройка CRM «{config.organizationName}»</h2>
        <p className="text-muted-foreground mt-1">Измените тип бизнеса и состав модулей рабочего пространства</p>
      </div>

      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3].map((step, index) => (
          <div key={step} className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep >= step
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-muted-foreground'
              }`}
            >
              {currentStep > step ? <Check className="w-5 h-5" /> : step}
            </div>
            {index < 2 && <div className={`wizard-connector w-24 h-0.5 ${currentStep > step ? 'bg-primary' : 'bg-border'}`}></div>}
          </div>
        ))}
      </div>

      <div className="bg-card rounded-lg border border-border p-8">
        {currentStep === 1 && (
          <div>
            <h3 className="text-xl mb-2">Шаг 1: Тип бизнеса</h3>
            <p className="text-muted-foreground mb-6">Выберите пресет для быстрого старта</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {BUSINESS_PRESETS.map((template) => (
                <button
                  key={template.id}
                  onClick={() => onConfigChange({ ...config, presetId: template.id })}
                  className={`p-6 rounded-lg border-2 transition-all text-left ${
                    config.presetId === template.id
                      ? 'border-primary bg-accent'
                      : 'border-border bg-card hover:border-primary/50'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                      config.presetId === template.id ? 'bg-primary' : 'bg-accent'
                    }`}
                  >
                    <template.icon
                      className={`w-6 h-6 ${
                        config.presetId === template.id ? 'text-primary-foreground' : 'text-foreground'
                      }`}
                    />
                  </div>
                  <h4 className="mb-2">{template.name}</h4>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <h3 className="text-xl mb-2">Шаг 2: Модули</h3>
            <p className="text-muted-foreground mb-6">Включите только нужный функционал</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MODULE_DEFINITIONS.map((module) => {
                const isEnabled = config.enabledModules.includes(module.id);

                return (
                  <div
                    key={module.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isEnabled ? 'border-primary bg-accent' : 'border-border bg-card'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="mb-1">{module.name}</h4>
                        <p className="text-sm text-muted-foreground">{module.description}</p>
                      </div>
                      <Switch checked={isEnabled} onCheckedChange={() => toggleModule(module.id)} aria-label={module.name} className="ml-4" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div>
            <h3 className="text-xl mb-2">Шаг 3: Проверка конфигурации</h3>
            <p className="text-muted-foreground mb-6">Настройки сохранены в браузере и применяются к интерфейсу {config.organizationName}</p>
            <div className="space-y-3">
              <div className="p-4 bg-accent rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Название CRM</p>
                <p className="mt-1">{config.organizationName}</p>
              </div>
              <div className="p-4 bg-accent rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Выбранный пресет</p>
                <p className="mt-1">{BUSINESS_PRESETS.find((preset) => preset.id === config.presetId)?.name}</p>
              </div>

              <div className="p-4 bg-accent rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">Активные модули</p>
                <div className="flex flex-wrap gap-2">
                  {config.enabledModules.map((moduleId) => {
                    const module = MODULE_DEFINITIONS.find((item) => item.id === moduleId);
                    if (!module) return null;
                    return (
                      <span key={moduleId} className="px-3 py-1 bg-primary text-primary-foreground text-sm rounded-full">
                        {module.name}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-8 pt-6 border-t border-border">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-6 py-2 border border-border rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Назад
          </button>
          <button
            onClick={() => setCurrentStep(Math.min(3, currentStep + 1))}
            disabled={currentStep === 3}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {currentStep === 3 ? 'Готово' : 'Далее'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
