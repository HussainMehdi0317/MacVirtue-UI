import React from "react";
import { motion } from "framer-motion";
import DockIcon from "./DockIcon";
import { useWindowStore } from "../../state/useWindowStore";

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

  // Track the dock DOM rect so we only react when the cursor is near/over it
  const dockRef = React.useRef<HTMLDivElement | null>(null);

  const icons = React.useMemo(
    () => [
      { id: "finder", label: "Files", appId: "finder" as const },
      { id: "notes", label: "Notes", appId: "notes" as const },
      { id: "settings", label: "Settings", appId: "settings" as const },
      { id: "calculator", label: "Calc", appId: "calculator" as const },
      { id: "terminal", label: "Term", appId: "terminal" as const }
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

      // Only respond when the cursor is visually close to the dock
      const dockEl = dockRef.current;
      if (!dockEl) return;
      const rect = dockEl.getBoundingClientRect();

      const hoverPadding = 120; // how far above the dock we still react
      const withinX = pageX >= rect.left - 32 && pageX <= rect.right + 32;
      const withinY = pageY >= rect.top - hoverPadding && pageY <= rect.bottom + 32;

      if (!(withinX && withinY)) {
        // Cursor is away from the dock; reset to neutral scales
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

  const baseIconWidth = 48;
  const gap = 12;
  const dockWidth =
    iconCenters.length > 0
      ? iconCenters.reduce(
          (sum, _c, idx) => sum + baseIconWidth * (scales[idx] || 1),
          0
        ) +
        gap * (iconCenters.length - 1)
      : icons.length * baseIconWidth + gap * (icons.length - 1);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
      <motion.div
        ref={dockRef}
        className="pointer-events-auto flex items-end rounded-3xl bg-black/40 border border-white/10 backdrop-blur-2xl px-3 py-1 shadow-[0_18px_50px_rgba(0,0,0,0.75)]"
        style={{ width: dockWidth }}
        layout
        transition={{ type: "spring", damping: 22, stiffness: 260 }}
      >
        {icons.map((icon, index) => (
          <DockIcon
            key={icon.id}
            ref={(el) => (iconRefs.current[index] = el)}
            label={icon.label}
            scale={scales[index] ?? 1}
            onOpen={() => openWindow(icon.appId)}
          />
        ))}
      </motion.div>
    </div>
  );
};

export default React.memo(DockContainer);
