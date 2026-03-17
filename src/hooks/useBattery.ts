import React from "react";

interface BatteryState {
  level: number | null;
  charging: boolean | null;
}

export const useBattery = (): BatteryState => {
  const [state, setState] = React.useState<BatteryState>({
    level: null,
    charging: null
  });

  React.useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (!("getBattery" in navigator)) {
        return;
      }
      try {
        // @ts-expect-error - experimental BatteryManager
        const battery: any = await navigator.getBattery();
        if (!mounted) return;

        const update = () => {
          if (!mounted) return;
          setState({
            level: battery.level != null ? battery.level * 100 : null,
            charging: battery.charging ?? null
          });
        };

        update();
        battery.addEventListener("levelchange", update);
        battery.addEventListener("chargingchange", update);

        return () => {
          battery.removeEventListener("levelchange", update);
          battery.removeEventListener("chargingchange", update);
        };
      } catch {
        // best-effort only
      }
    };

    const cleanupPromise = init();

    return () => {
      mounted = false;
      void cleanupPromise;
    };
  }, []);

  return state;
};
