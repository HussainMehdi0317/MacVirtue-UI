import React from "react";
import { useLocation } from "react-router-dom";
import Router from "./router";
import { useSystemStore } from "../state/useSystemStore";

const App: React.FC = () => {
  const location = useLocation();
  const [initialized, setInitialized] = React.useState(false);
  const setEntryMode = useSystemStore((s) => s.setEntryMode);

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const entry = params.get("entry");
    if (entry === "qr") {
      setEntryMode("lite");
    } else if (window.innerWidth < 720) {
      setEntryMode("lite");
    } else {
      setEntryMode("desktop");
    }
    setInitialized(true);
  }, [location.search, setEntryMode]);

  if (!initialized) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950">
        <div className="text-sm text-slate-300">Starting MacVirtue UI…</div>
      </div>
    );
  }

  return <Router />;
};

export default App;
