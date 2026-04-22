import React from "react";
import { SnakeGame } from "./SnakeGame";

export const SnakeApp: React.FC = () => {
  return (
    <div className="w-full h-full bg-gray-900">
      <SnakeGame />
    </div>
  );
};

export default SnakeApp;
