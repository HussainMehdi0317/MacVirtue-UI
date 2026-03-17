import React from "react";
import { Routes, Route } from "react-router-dom";
import DesktopRoot from "../components/Desktop/DesktopRoot";
import LiteLauncher from "../components/Desktop/LiteLauncher";
import { useSystemStore } from "../state/useSystemStore";

const Router: React.FC = () => {
  const entryMode = useSystemStore((s) => s.entryMode);

  return (
    <Routes>
      <Route
        path="/"
        element={entryMode === "lite" ? <LiteLauncher /> : <DesktopRoot />}
      />
    </Routes>
  );
};

export default Router;
