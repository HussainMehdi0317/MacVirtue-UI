import React from "react";
import { motion } from "framer-motion";
import DockIcon from "./DockIcon";
import { useWindowStore } from "../../state/useWindowStore";

// SVG icon components
const FilesIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" />
  </svg>
);

const NotesIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-8v2h8v-2zm0-4h-8v2h8V9z" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l1.72-1.35c.15-.12.19-.34.09-.51l-1.64-2.84c-.1-.17-.31-.24-.49-.17l-2.03.81c-.42-.32-.88-.58-1.38-.78l-.31-2.16c-.04-.2-.21-.34-.43-.34h-3.28c-.22 0-.39.14-.43.34l-.31 2.16c-.5.2-.96.46-1.38.78l-2.03-.81c-.18-.07-.39 0-.49.17l-1.64 2.84c-.1.17-.06.39.09.51l1.72 1.35c-.05.3-.07.62-.07.94s.02.64.07.94l-1.72 1.35c-.15.12-.19.34-.09.51l1.64 2.84c.1.17.31.24.49.17l2.03-.81c.42.32.88.58 1.38.78l.31 2.16c.05.2.21.34.43.34h3.28c.22 0 .39-.14.43-.34l.31-2.16c.5-.2.96-.46 1.38-.78l2.03.81c.18.07.39 0 .49-.17l1.64-2.84c.1-.17.06-.39-.09-.51l-1.72-1.35zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
  </svg>
);

const CalcIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM7 7h3v3H7V7zm3 9H7v3h3v-3zm3-9h3v3h-3V7zm3 9h-3v3h3v-3zm0-4h-3v3h3v-3z" />
  </svg>
);

const TerminalIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M5 3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H5zm2 12h8v2H7v-2zm0-4h8v2H7v-2z" />
  </svg>
);

const PacManIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="8" fill="#FFD700" />
    <path d="M 12 12 L 18 8 L 18 16 Z" fill="#000000" />
  </svg>
);

const SnakeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="18" cy="6" r="2" fill="#00FF00"/>
    <circle cx="14" cy="6" r="2" fill="#00CC00"/>
    <circle cx="10" cy="6" r="2" fill="#00AA00"/>
    <circle cx="6" cy="6" r="2" fill="#009900"/>
    <circle cx="6" cy="10" r="2" fill="#008800"/>
    <circle cx="6" cy="14" r="2" fill="#007700"/>
    <circle cx="10" cy="14" r="2" fill="#006600"/>
    <circle cx="14" cy="14" r="2" fill="#005500"/>
    <rect x="13" y="13" width="8" height="8" fill="#FF3333" rx="1"/>
  </svg>
);

const A = 0.7;
const SIGMA = 150;

function gaussianScale(xi: number, mu: number) {
  const diff = xi - mu;
  const denom = 2 * SIGMA * SIGMA;
  const exponent = -((diff * diff) / denom);
  return 1 + A * Math.exp(exponent);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

const DockContainer: React.FC = () => {
  const openWindow = useWindowStore((s) => s.openWindow);
  const [cursorX, setCursorX] = React.useState<number | null>(null);
  const [iconCenters, setIconCenters] = React.useState<number[]>([]);
  const iconRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const [scales, setScales] = React.useState<number[]>([]);
  const requestRef = React.useRef<number | null>(null);

  const dockRef = React.useRef<HTMLDivElement | null>(null);

  const icons = React.useMemo(
    () => [
      { id: "finder", label: "Files", appId: "finder" as const, icon: <FilesIcon /> },
      { id: "notes", label: "Notes", appId: "notes" as const, icon: <NotesIcon /> },
      { id: "settings", label: "Settings", appId: "settings" as const, icon: <SettingsIcon /> },
      { id: "calculator", label: "Calc", appId: "calculator" as const, icon: <CalcIcon /> },
      { id: "pacman", label: "PacMan", appId: "pacman" as const, icon: <PacManIcon /> },
      { id: "snake", label: "Snake", appId: "snake" as const, icon: <SnakeIcon /> },
      { id: "terminal", label: "Term", appId: "terminal" as const, icon: <TerminalIcon /> }
    ],
    []
  );

  React.useEffect(() => {
    const computeCenters = () => {
      const centers = iconRefs.current.map((el) => {
        if (!el) return 0;
        const rect = el.getBoundingClientRect();
        return rect.left + rect.width / 2;
      });
      setIconCenters(centers);
      if (!scales.length) {
        setScales(centers.map(() => 1));
      }
    };
    computeCenters();
    window.addEventListener("resize", computeCenters);
    return () => window.removeEventListener("resize", computeCenters);
  }, [scales.length]);

  React.useEffect(() => {
    const handleMove = (ev: MouseEvent) => {
      const pageX = ev.clientX;
      const pageY = ev.clientY;

      const dockEl = dockRef.current;
      if (!dockEl) return;
      const rect = dockEl.getBoundingClientRect();

      // Tighter hover band so dock only reacts when you're close to it
      const hoverPaddingY = 40; // distance above dock
      const hoverPaddingX = 16; // horizontal padding

      const withinX =
        pageX >= rect.left - hoverPaddingX && pageX <= rect.right + hoverPaddingX;
      const withinY =
        pageY >= rect.top - hoverPaddingY && pageY <= rect.bottom + 16;

      if (!(withinX && withinY)) {
        if (cursorX !== null) {
          setCursorX(null);
        }
        return;
      }

      if (requestRef.current != null) return;
      requestRef.current = requestAnimationFrame(() => {
        requestRef.current = null;
        setCursorX(pageX);
      });
    };

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [cursorX]);

  React.useEffect(() => {
    if (cursorX == null || iconCenters.length === 0) {
      setScales(iconCenters.map(() => 1));
      return;
    }

    setScales((prev) => {
      const delta = 0.16;
      const transitionSpeed = 8;
      return iconCenters.map((xi, idx) => {
        const target = gaussianScale(xi, cursorX);
        const t = Math.min(1, delta * transitionSpeed);
        const previous = prev[idx] ?? 1;
        return lerp(previous, target, t);
      });
    });
  }, [cursorX, iconCenters]);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
      <motion.div
        ref={dockRef}
        className="pointer-events-auto inline-flex items-end rounded-3xl bg-black/40 border border-white/10 backdrop-blur-2xl px-4 py-1.5 shadow-[0_18px_50px_rgba(0,0,0,0.75)]"
        layout
        transition={{ type: "spring", damping: 22, stiffness: 260 }}
      >
        {icons.map((icon, index) => (
          <DockIcon
            key={icon.id}
            ref={(el) => (iconRefs.current[index] = el)}
            label={icon.label}
            scale={scales[index] ?? 1}
            icon={icon.icon}
            onOpen={() => openWindow(icon.appId)}
          />
        ))}
      </motion.div>
    </div>
  );
};

export default React.memo(DockContainer);
