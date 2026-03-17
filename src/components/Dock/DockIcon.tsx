import React from "react";
import { motion } from "framer-motion";

interface DockIconProps {
  label: string;
  scale: number;
  onOpen: () => void;
}

const DockIcon = React.forwardRef<HTMLButtonElement, DockIconProps>(
  ({ label, scale, onOpen }, ref) => {
    const [launching, setLaunching] = React.useState(false);

    const handleClick = () => {
      setLaunching(true);
      onOpen();
      setTimeout(() => setLaunching(false), 600);
    };

    return (
      <motion.button
        ref={ref}
        className="mx-1 flex flex-col items-center justify-end pt-2 pb-1 w-12"
        onClick={handleClick}
        style={{ originY: 1 }}
        animate={{
          scale: launching ? scale * 1.1 : scale
        }}
        transition={{
          type: "spring",
          stiffness: 240,
          damping: 18
        }}
      >
        <motion.div
          className="w-10 h-10 rounded-2xl bg-slate-100/90 text-slate-900 flex items-center justify-center shadow-lg shadow-black/50"
          animate={
            launching
              ? {
                  translateY: [-2, -10, 0],
                  scaleY: [1, 0.9, 1],
                  scaleX: [1, 1.05, 1]
                }
              : { translateY: 0, scaleX: 1, scaleY: 1 }
          }
          transition={{
            duration: 0.5,
            type: "spring",
            stiffness: 280,
            damping: 20
          }}
        >
          <span className="text-sm font-semibold">
            {label.slice(0, 2).toUpperCase()}
          </span>
        </motion.div>
        <span className="mt-1 text-[10px] text-slate-200">{label}</span>
      </motion.button>
    );
  }
);

DockIcon.displayName = "DockIcon";

export default DockIcon;
