import React from "react";
import { useClock } from "../../hooks/useClock";
import { useBattery } from "../../hooks/useBattery";
import { useOnline } from "../../hooks/useOnline";

const SystemStatus: React.FC = () => {
  const { formatted } = useClock();
  const battery = useBattery();
  const online = useOnline();

  return (
    <div className="flex items-center space-x-3">
      <span
        className={`text-[11px] ${
          online ? "text-emerald-300" : "text-amber-300"
        }`}
      >
        {online ? "Online" : "Offline"}
      </span>
      <span className="text-[11px]">
        {battery.level != null ? `${Math.round(battery.level)}%` : "--"}
        {battery.charging === true ? " ⚡" : ""}
      </span>
      <span className="text-[11px] tabular-nums">{formatted}</span>
    </div>
  );
};

export default SystemStatus;
