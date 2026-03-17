import { create } from "zustand";

type EntryMode = "lite" | "desktop";

export type PermissionAction =
  | "make_folder"
  | "open_file"
  | "open_url"
  | "close_app"
  | "sleep_system"
  | "set_wallpaper"
  | "network_details";

export type PermissionDecision = "allow-once" | "allow-always" | "deny";

export interface PermissionPreference {
  action: PermissionAction;
  decision: PermissionDecision;
  timestamp: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: PermissionAction | "info";
  details: string;
  result: "allowed" | "denied" | "error";
}

interface SystemStore {
  entryMode: EntryMode;
  setEntryMode: (mode: EntryMode) => void;

  batteryPercent?: number;
  isCharging?: boolean;

  isOnline: boolean;
  setOnline: (online: boolean) => void;

  permissions: PermissionPreference[];
  auditLog: AuditEntry[];

  recordAudit: (entry: Omit<AuditEntry, "id" | "timestamp">) => void;
  upsertPermission: (pref: PermissionPreference) => void;
}

export const useSystemStore = create<SystemStore>((set, get) => ({
  entryMode: "desktop",
  setEntryMode: (mode) => set({ entryMode: mode }),

  isOnline: navigator.onLine,
  setOnline: (online) => set({ isOnline: online }),

  permissions: [],
  auditLog: [],

  recordAudit: ({ action, details, result }) =>
    set((state) => ({
      auditLog: [
        ...state.auditLog,
        {
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          timestamp: new Date().toISOString(),
          action,
          details,
          result
        }
      ]
    })),

  upsertPermission: (pref) =>
    set((state) => {
      const filtered = state.permissions.filter(
        (p) => p.action !== pref.action
      );
      return {
        permissions: [...filtered, pref]
      };
    })
}));
