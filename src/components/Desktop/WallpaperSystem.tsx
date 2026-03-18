import React from "react";

const WallpaperSystem: React.FC = () => {
  return (
    <div 
      aria-hidden 
      className="fixed inset-0 -z-50 overflow-hidden"
      style={{
        backgroundImage: "url('/media/wallpaper.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed"
      }}
    />
  );
};

export default WallpaperSystem;
