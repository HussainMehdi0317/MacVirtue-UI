import React from "react";
import { AnimatePresence } from "framer-motion";
import { useWindowStore } from "../../state/useWindowStore";
import WindowContainer from "./WindowContainer";

const WindowManager: React.FC = () => {
  const windows = useWindowStore((s) => s.windows);

  return (
    <div className="absolute inset-0 pointer-events-none">
      <AnimatePresence>
        {windows.map((w) => (
          <WindowContainer key={w.id} window={w} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default React.memo(WindowManager);
