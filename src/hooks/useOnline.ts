import React from "react";
import { useSystemStore } from "../state/useSystemStore";

export const useOnline = () => {
  const isOnline = useSystemStore((s) => s.isOnline);
  const setOnline = useSystemStore((s) => s.setOnline);

  React.useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [setOnline]);

  return isOnline;
};
