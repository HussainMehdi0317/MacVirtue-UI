import React from "react";

const WallpaperSystem: React.FC = () => {
  return (
    <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
      {/* macOS Big Sur–style multicolor gradient backdrop */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 15%, #ff5f6c 0, #ff5f6c 20%, transparent 55%)," +
            "radial-gradient(circle at 75% 10%, #ffb347 0, #ffb347 22%, transparent 55%)," +
            "radial-gradient(circle at 15% 85%, #36d1dc 0, #36d1dc 22%, transparent 55%)," +
            "radial-gradient(circle at 85% 80%, #5b86e5 0, #5b86e5 24%, transparent 60%)," +
            "linear-gradient(135deg, #0b1020, #091b3f 45%, #02111f 70%, #010713)",
          backgroundSize: "120% 120%",
          backgroundPosition: "center",
        }}
      />

      {/* Soft fades at top and bottom to mimic macOS menu bar/edge falloff */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/35 via-black/10 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />

      {/* Very subtle grain/noise overlay to avoid banding */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.2] mix-blend-soft-light"
        style={{
          backgroundImage:
            "url('data:image/svg+xml;utf8,<svg xmlns=%27http://www.w3.org/2000/svg%27 width=%27160%27 height=%27160%27 viewBox=%270 0 160 160%27><filter id=%27n%27 x=%27-20%27 y=%27-20%27 width=%27140%27 height=%27140%27 filterUnits=%27objectBoundingBox%27><feTurbulence type=%27fractalNoise%27 baseFrequency=%270.8%27 numOctaves=%272%27 stitchTiles=%27noStitch%27/></filter><rect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27 opacity=%270.4%27/></svg>')",
          backgroundSize: "320px 320px",
        }}
      />
    </div>
  );
};

export default WallpaperSystem;
