import React from "react";
import { useWindowStore } from "../../state/useWindowStore";

const DesktopIcons: React.FC = () => {
  const openWindow = useWindowStore((s) => s.openWindow);

  const icons = [
    { id: "finder", label: "Files", appId: "finder" as const },
    { id: "notes", label: "Notes", appId: "notes" as const },
    { id: "settings", label: "Settings", appId: "settings" as const }
  ];

  return (
    <div className="absolute inset-0 pt-12 pl-6 space-y-4 text-xs select-none">
      {icons.map((icon) => (
        <button
          key={icon.id}
          className="flex flex-col items-center w-16 text-slate-100/90 hover:text-white group"
          onDoubleClick={() => openWindow(icon.appId)}
        >
          <div className="w-12 h-12 mb-1 rounded-2xl bg-slate-800/60 group-hover:bg-slate-700/80 shadow-lg shadow-black/40 flex items-center justify-center">
            <span className="text-lg font-semibold">{icon.label[0]}</span>
          </div>
          <span className="text-[11px] text-center">{icon.label}</span>
        </button>
      ))}
    </div>
  );
};

export default DesktopIcons;
