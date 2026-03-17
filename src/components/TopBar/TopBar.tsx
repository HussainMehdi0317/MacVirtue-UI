import React from "react";
import SystemStatus from "./SystemStatus";

const TopBar: React.FC = () => {
  return (
    <div className="absolute top-0 inset-x-0 h-8 flex items-center justify-between px-3 text-xs text-slate-100/90 bg-gradient-to-b from-black/60 via-black/40 to-transparent backdrop-blur-xl border-b border-white/5">
      <div className="flex items-center space-x-3">
        <span className="font-semibold text-[11px] tracking-wide">
          MacVirtue
        </span>
        <button className="text-[11px] text-slate-300 hover:text-white">
          Desktop
        </button>
      </div>
      <SystemStatus />
    </div>
  );
};

export default TopBar;
