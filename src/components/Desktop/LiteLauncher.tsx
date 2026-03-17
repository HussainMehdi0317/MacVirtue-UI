import React from "react";
import { useWindowStore } from "../../state/useWindowStore";
import { useSystemStore } from "../../state/useSystemStore";

const LiteLauncher: React.FC = () => {
  const openWindow = useWindowStore((s) => s.openWindow);
  const setEntryMode = useSystemStore((s) => s.setEntryMode);

  const apps = [
    { id: "finder", label: "Files" },
    { id: "notes", label: "Notes" },
    { id: "settings", label: "Settings" },
    { id: "terminal", label: "Terminal" }
  ];

  return (
    <div className="min-h-full bg-slate-950 text-slate-50 flex flex-col">
      <header className="px-4 py-3 border-b border-white/5 flex justify-between items-center">
        <div>
          <div className="text-sm font-semibold">MacVirtue Lite</div>
          <div className="text-xs text-slate-400">
            QR entry · sandboxed demo · no native actions
          </div>
        </div>
        <button
          className="text-xs px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10"
          onClick={() => setEntryMode("desktop")}
        >
          Full Desktop
        </button>
      </header>
      <main className="flex-1 px-4 py-4 space-y-3">
        {apps.map((app) => (
          <button
            key={app.id}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10"
            onClick={() => openWindow(app.id as any)}
          >
            <div>
              <div className="text-sm font-medium">{app.label}</div>
              <div className="text-[11px] text-slate-400">
                Opens inside lite desktop shell
              </div>
            </div>
            <span className="text-xs text-slate-400">Launch</span>
          </button>
        ))}
      </main>
    </div>
  );
};

export default LiteLauncher;
