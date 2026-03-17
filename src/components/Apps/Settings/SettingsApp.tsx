import React from "react";
import PermissionsPanel from "./PermissionsPanel";
import AuditLogView from "./AuditLogView";

const SettingsApp: React.FC = () => {
  const [tab, setTab] = React.useState<"permissions" | "security" | "wallpaper">(
    "permissions"
  );

  return (
    <div className="h-full flex text-xs text-slate-100">
      <aside className="w-32 border-r border-white/10 bg-white/3">
        <button
          className={`block w-full text-left px-3 py-2 text-[11px] ${
            tab === "permissions" ? "bg-white/10" : "hover:bg-white/5"
          }`}
          onClick={() => setTab("permissions")}
        >
          Permissions
        </button>
        <button
          className={`block w-full text-left px-3 py-2 text-[11px] ${
            tab === "security" ? "bg-white/10" : "hover:bg-white/5"
          }`}
          onClick={() => setTab("security")}
        >
          Security Log
        </button>
        <button
          className={`block w-full text-left px-3 py-2 text-[11px] ${
            tab === "wallpaper" ? "bg-white/10" : "hover:bg-white/5"
          }`}
          onClick={() => setTab("wallpaper")}
        >
          Wallpaper
        </button>
      </aside>
      <main className="flex-1 p-3 overflow-auto">
        {tab === "permissions" && <PermissionsPanel />}
        {tab === "security" && <AuditLogView />}
        {tab === "wallpaper" && (
          <div className="text-[11px] space-y-2">
            <p className="text-slate-300">
              Wallpaper chooser would live here. For now, this is a placeholder.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default SettingsApp;
