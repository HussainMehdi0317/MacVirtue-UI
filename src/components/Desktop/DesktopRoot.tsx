import React from "react";
import TopBar from "../TopBar/TopBar";
import DockContainer from "../Dock/DockContainer";
import WindowManager from "../Window/WindowManager";
import WallpaperSystem from "./WallpaperSystem";
import DesktopIcons from "./DesktopIcons";
import ContextMenu from "./ContextMenu";

const DesktopRoot: React.FC = () => {
  return (
    <div className="h-full w-full relative overflow-hidden bg-black text-white">
      <WallpaperSystem />
      <TopBar />
      <DesktopIcons />
      <WindowManager />
      <DockContainer />
      <ContextMenu />
    </div>
  );
};

export default React.memo(DesktopRoot);
