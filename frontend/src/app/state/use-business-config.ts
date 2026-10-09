import { useEffect, useState } from 'react';
import { BusinessConfig, BUSINESS_PRESETS, MODULE_DEFINITIONS, DEFAULT_BUSINESS_CONFIG, STORAGE_KEYS } from '../config/business-config';

function readBusinessConfig(): BusinessConfig {
  try {
    const value = localStorage.getItem(STORAGE_KEYS.businessConfig);
    if (!value) {
      return DEFAULT_BUSINESS_CONFIG;
    }

    const parsed = JSON.parse(value) as Partial<BusinessConfig>;
    if (
      typeof parsed.organizationName !== 'string' ||
      typeof parsed.ownerName !== 'string' ||
      typeof parsed.ownerEmail !== 'string' ||
      typeof parsed.isOnboardingCompleted !== 'boolean' ||
      (parsed.organizationId !== undefined && parsed.organizationId !== null && typeof parsed.organizationId !== 'number') ||
      !BUSINESS_PRESETS.some(preset => preset.id === parsed.presetId) ||
      !Array.isArray(parsed.enabledModules)
    ) {
      return DEFAULT_BUSINESS_CONFIG;
    }

    return {
      organizationId: typeof parsed.organizationId === 'number' ? parsed.organizationId : null,
      organizationName: parsed.organizationName.trim(),
      ownerName: parsed.ownerName.trim(),
      ownerEmail: parsed.ownerEmail.trim(),
      presetId: parsed.presetId as BusinessConfig['presetId'],
      enabledModules: [...new Set(parsed.enabledModules.filter(id => MODULE_DEFINITIONS.some(module => module.id === id)))],
      isOnboardingCompleted: parsed.isOnboardingCompleted,
    };
  } catch {
    return DEFAULT_BUSINESS_CONFIG;
  }
}

export function useBusinessConfig() {
  const [config, setConfig] = useState<BusinessConfig>(readBusinessConfig);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.businessConfig, JSON.stringify(config));
    } catch {
      // Configuration still works in memory when browser storage is unavailable.
    }
  }, [config]);

  return { config, setConfig };
}
