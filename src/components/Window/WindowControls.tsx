import React from "react";

interface Props {
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
}

const WindowControls: React.FC<Props> = ({
  onClose,
  onMinimize,
  onMaximize
}) => {
  return (
    <div className="flex items-center space-x-1">
      <button
        onClick={onClose}
        className="w-3 h-3 rounded-full bg-red-500/90 border border-red-400/90"
      />
      <button
        onClick={onMinimize}
        className="w-3 h-3 rounded-full bg-amber-400/90 border border-amber-300/90"
      />
      <button
        onClick={onMaximize}
        className="w-3 h-3 rounded-full bg-emerald-400/90 border border-emerald-300/90"
      />
    </div>
  );
};

export default React.memo(WindowControls);
