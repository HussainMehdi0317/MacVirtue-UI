import { create } from "zustand";

export type AppId = "finder" | "settings" | "notes" | "calculator" | "terminal" | "pacman";

export interface WindowState {
  id: string;
  appId: AppId;
  title: string;
  zIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  minimized: boolean;
  maximized: boolean;
  isFocused: boolean;
}

interface WindowStore {
  windows: WindowState[];
  nextZ: number;
  openWindow: (appId: AppId) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  moveWindow: (id: string, x: number, y: number) => void;
  resizeWindow: (id: string, width: number, height: number) => void;
}

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: [],
  nextZ: 1,

  openWindow: (appId) =>
    set((state) => {
      const id = `${appId}-${Date.now()}`;
      const z = state.nextZ + 1;

      // App-specific base positions so every app doesn't appear at the exact same spot
      const appOffsets: Record<AppId, { x: number; y: number }> = {
        finder: { x: 80, y: 80 },
        settings: { x: 320, y: 120 },
        notes: { x: 180, y: 180 },
        calculator: { x: 420, y: 160 },
        pacman: { x: 250, y: 140 },
        terminal: { x: 220, y: 220 }
      };
      const baseOffset = appOffsets[appId];

      // PacMan should open in fullscreen/maximized
      const shouldMaximize = appId === "pacman";

      const base: WindowState = {
        id,
        appId,
        title:
          appId.charAt(0).toUpperCase() + appId.slice(1).replace("-", " "),
        zIndex: z,
        x: baseOffset.x,
        y: baseOffset.y,
        width: 720,
        height: 480,
        minimized: false,
        maximized: shouldMaximize,
        isFocused: true
      };
      const windows = state.windows.map((w) => ({ ...w, isFocused: false }));
      return { windows: [...windows, base], nextZ: z };
    }),

  closeWindow: (id) =>
    set((state) => ({
      windows: state.windows.filter((w) => w.id !== id)
    })),

  minimizeWindow: (id) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, minimized: true, isFocused: false } : w
      )
    })),

  maximizeWindow: (id) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, maximized: !w.maximized } : w
      )
    })),

  focusWindow: (id) =>
    set((state) => {
      const z = state.nextZ + 1;
      return {
        nextZ: z,
        windows: state.windows.map((w) =>
          w.id === id
            ? { ...w, zIndex: z, isFocused: true, minimized: false }
            : { ...w, isFocused: false }
        )
      };
    }),

  moveWindow: (id, x, y) =>
    set((state) => ({
      windows: state.windows.map((w) => (w.id === id ? { ...w, x, y } : w))
    })),

  resizeWindow: (id, width, height) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, width, height } : w
      )
    }))
}));
