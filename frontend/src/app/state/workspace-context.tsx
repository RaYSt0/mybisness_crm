import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { emptyDraft, initialSetup, mockWorkspaceService, readDraft, seedWorkspace } from "../product/mockWorkspaceService";
import { isWorkspaceApiConfigured, workspaceApi } from "../product/workspaceApi";
import type { BusinessCategory, DashboardSummary, PersistedWorkspace, RegistrationDraft, SectionId, WorkspaceData, WorkspaceSetup } from "../product/model";

interface WorkspaceContextValue {
  draft: RegistrationDraft; setDraft: (draft: RegistrationDraft) => void;
  setup: WorkspaceSetup | null; data: WorkspaceData | null; ready: boolean;
  summary: DashboardSummary | null; serverConnected: boolean; serverMessage: string;
  startConfiguration: (category: BusinessCategory, description: string) => void;
  updateSetup: (setup: WorkspaceSetup) => void; completeSetup: () => Promise<void>; reset: () => void;
  addClient: (value: { name: string; contact: string; email: string; segment: string }) => void;
  toggleTask: (id: string) => void; toggleAutomation: (id: string) => void;
  enabledSections: SectionId[];
}

const Context = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [draft, setDraftState] = useState(readDraft);
  const [persisted, setPersisted] = useState<PersistedWorkspace | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [serverConnected, setServerConnected] = useState(false);
  const [serverMessage, setServerMessage] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    void mockWorkspaceService.load().then(async local => {
      let next = local;
      if (local?.setup.organizationId && isWorkspaceApiConfigured) {
        try {
          const [configuration, clients, dashboard] = await Promise.all([
            workspaceApi.loadConfiguration(local.setup.organizationId),
            workspaceApi.listClients(local.setup.organizationId),
            workspaceApi.dashboardSummary(local.setup.organizationId),
          ]);
          next = {
            ...local,
            setup: { ...configuration.configuration, organizationId: local.setup.organizationId, configurationVersion: configuration.version },
            data: { ...local.data, clients },
          };
          await mockWorkspaceService.save(next);
          if (active) { setSummary(dashboard); setServerConnected(true); setServerMessage(""); }
        } catch (cause) {
          if (active) setServerMessage(cause instanceof Error ? cause.message : "Не удалось загрузить данные сервера.");
        }
      }
      if (active) { setPersisted(next); setReady(true); }
    });
    return () => { active = false; };
  }, []);

  const setDraft = (value: RegistrationDraft) => {
    setDraftState(value);
    localStorage.setItem("flowbiz.registration.v1", JSON.stringify(value));
  };
  const save = (value: PersistedWorkspace) => {
    setPersisted(value);
    void mockWorkspaceService.save(value);
  };
  const startConfiguration = (category: BusinessCategory, description: string) => {
    save({ setup: initialSetup(draft, category, description), data: seedWorkspace(category) });
  };
  const updateSetup = (setup: WorkspaceSetup) => {
    if (!persisted) return;
    const next = { ...persisted, setup };
    save(next);
    if (setup.organizationId && isWorkspaceApiConfigured) {
      void workspaceApi.saveConfiguration(setup.organizationId, setup).then(version => {
        const current = { ...next, setup: { ...setup, configurationVersion: version } };
        save(current); setServerConnected(true); setServerMessage("");
      }).catch(cause => setServerMessage(cause instanceof Error ? cause.message : "Не удалось сохранить конфигурацию на сервере."));
    }
  };
  const completeSetup = async () => {
    if (!persisted) return;
    let current = persisted;
    if (isWorkspaceApiConfigured) {
      try {
        let organizationId = current.setup.organizationId;
        if (!organizationId) {
          organizationId = await workspaceApi.createOrganization(current.setup);
          current = { ...current, setup: { ...current.setup, organizationId } };
          save(current);
        }
        const version = await workspaceApi.saveConfiguration(organizationId, current.setup);
        const [clients, dashboard] = await Promise.all([
          workspaceApi.listClients(organizationId),
          workspaceApi.dashboardSummary(organizationId),
        ]);
        current = {
          ...current,
          setup: { ...current.setup, configurationVersion: version },
          data: { ...current.data, clients },
        };
        save(current); setSummary(dashboard); setServerConnected(true); setServerMessage("");
      } catch (cause) {
        setServerConnected(false);
        setServerMessage(cause instanceof Error ? cause.message : "Сервер недоступен. Пространство сохранено в демо-режиме.");
      }
    }
  };
  const reset = () => {
    localStorage.removeItem("flowbiz.workspace.v1");
    localStorage.removeItem("flowbiz.registration.v1");
    setDraftState(emptyDraft); setPersisted(null); setSummary(null); setServerConnected(false); setServerMessage("");
  };
  const addClient = (value: { name: string; contact: string; email: string; segment: string }) => {
    if (!persisted) return;
    const payload = { ...value, status: "new" as const, note: "Добавлен из рабочего пространства." };
    const addLocally = () => void mockWorkspaceService.addClient(payload).then(client => {
      setPersisted(previous => {
        if (!previous) return previous;
        const next = { ...previous, data: { ...previous.data, clients: [client, ...previous.data.clients] } };
        void mockWorkspaceService.save(next);
        return next;
      });
    });
    if (persisted.setup.organizationId && isWorkspaceApiConfigured) {
      void workspaceApi.addClient(persisted.setup.organizationId, payload).then(client => {
        setPersisted(previous => {
          if (!previous) return previous;
          const next = { ...previous, data: { ...previous.data, clients: [client, ...previous.data.clients] } };
          void mockWorkspaceService.save(next);
          return next;
        });
        setSummary(current => current ? { ...current, total_clients: current.total_clients + 1, new_clients: current.new_clients + 1 } : current);
        setServerConnected(true); setServerMessage("");
      }).catch(cause => { setServerMessage(cause instanceof Error ? cause.message : "Не удалось сохранить клиента."); addLocally(); });
    } else addLocally();
  };
  const toggleTask = (id: string) => {
    if (!persisted) return;
    save({ ...persisted, data: { ...persisted.data, tasks: persisted.data.tasks.map(task => task.id === id ? { ...task, done: !task.done } : task) } });
  };
  const toggleAutomation = (id: string) => {
    if (!persisted) return;
    updateSetup({ ...persisted.setup, automations: persisted.setup.automations.map(item => item.id === id ? { ...item, enabled: !item.enabled } : item) });
  };
  const enabledSections = useMemo(() => persisted?.setup.entities.filter(entity => entity.enabled).map(entity => entity.section).filter((value, index, all) => all.indexOf(value) === index) ?? [], [persisted]);
  const value: WorkspaceContextValue = {
    draft, setDraft, setup: persisted?.setup ?? null, data: persisted?.data ?? null, ready,
    summary, serverConnected, serverMessage, startConfiguration, updateSetup, completeSetup, reset,
    addClient, toggleTask, toggleAutomation, enabledSections,
  };
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useWorkspace() {
  const context = useContext(Context);
  if (!context) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return context;
}
