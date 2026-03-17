import React from "react";
import { motion } from "framer-motion";
import {
  useWindowStore,
  WindowState
} from "../../state/useWindowStore";
import WindowControls from "./WindowControls";
import FinderApp from "../Apps/Finder/FinderApp";
import SettingsApp from "../Apps/Settings/SettingsApp";
import NotesApp from "../Apps/Notes/NotesApp";
import CalculatorApp from "../Apps/Calculator/CalculatorApp";
import TerminalApp from "../Apps/Terminal/TerminalApp";

interface Props {
  window: WindowState;
}

const appContent = (appId: WindowState["appId"]) => {
  switch (appId) {
    case "finder":
      return <FinderApp />;
    case "settings":
      return <SettingsApp />;
    case "notes":
      return <NotesApp />;
    case "calculator":
      return <CalculatorApp />;
    case "terminal":
      return <TerminalApp />;
    default:
      return null;
  }
};

const WindowContainer: React.FC<Props> = ({ window }) => {
  const { id, x, y, width, height, minimized, maximized, zIndex, title } =
    window;
  const { closeWindow, minimizeWindow, maximizeWindow, focusWindow, moveWindow } =
    useWindowStore.getState();

  const handleMouseDown = () => {
    focusWindow(id);
  };

  const [dragOffset, setDragOffset] = React.useState<{ dx: number; dy: number } | null>(
    null
  );

  const handleMouseDownDrag: React.MouseEventHandler<HTMLDivElement> = (ev) => {
    handleMouseDown();
    // When maximized, ignore drag until unmaximized
    if (maximized) return;
    setDragOffset({ dx: ev.clientX - x, dy: ev.clientY - y });
  };

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (ev) => {
    if (!dragOffset || maximized) return;
    // Move synchronously; we've removed layout animations during drag to keep it snappy
    moveWindow(id, ev.clientX - dragOffset.dx, ev.clientY - dragOffset.dy);
  };

  const handleMouseUp: React.MouseEventHandler<HTMLDivElement> = () => {
    setDragOffset(null);
  };

  // Use a layout-animated container so maximize behaves like a smooth resize
  const style = maximized
    ? {
        left: 0,
        top: 32,
        width: "100vw",
        height: "calc(100vh - 32px)",
      }
    : {
        left: x,
        top: y,
        width,
        height,
      } as const;

  if (minimized) {
    return null;
  }

  const isDragging = !!dragOffset;

  return (
    <motion.div
      className="absolute pointer-events-auto flex flex-col rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-2xl shadow-[0_40px_120px_rgba(0,0,0,0.8)] overflow-hidden"
      style={{ ...style, zIndex: zIndex as number }}
      layout={!isDragging}
      transition={{
        type: "spring",
        stiffness: 220,
        damping: 24,
      }}
      initial={{ opacity: 0, scale: 0.9, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        className="h-8 flex items-center justify-between px-3 bg-gradient-to-b from-white/8 via-white/3 to-transparent cursor-move"
        onMouseDown={handleMouseDownDrag}
      >
        <WindowControls
          onClose={() => closeWindow(id)}
          onMinimize={() => minimizeWindow(id)}
          onMaximize={() => maximizeWindow(id)}
        />
        <div className="flex-1 text-center text-xs text-slate-200 select-none">
          {title}
        </div>
        <div className="w-16" />
      </div>
      <div className="flex-1 bg-slate-950/80">{appContent(window.appId)}</div>
    </motion.div>
  );
};

export default React.memo(WindowContainer);
