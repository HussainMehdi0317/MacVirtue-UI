const STORAGE_KEY = "macvirtue-mock-fs";

function loadFs(): Record<string, string[]> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { "/sandbox": [] };
    return JSON.parse(raw);
  } catch {
    return { "/sandbox": [] };
  }
}

function saveFs(fs: Record<string, string[]>) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fs));
}

const fsData: { fs: Record<string, string[]> } = {
  fs: loadFs()
};

function ensurePath(path: string) {
  if (!fsData.fs[path]) fsData.fs[path] = [];
}

export const mockFsApi = {
  async listDirectory(path: string): Promise<string[]> {
    ensurePath(path);
    return [...fsData.fs[path]];
  },
  async makeFolder(path: string): Promise<void> {
    const lastSlash = path.lastIndexOf("/");
    const parent = path.slice(0, lastSlash) || "/";
    const name = path.slice(lastSlash + 1);
    ensurePath(parent);
    if (!fsData.fs[parent].includes(name)) fsData.fs[parent].push(name);
    ensurePath(path);
    saveFs(fsData.fs);
  },
  async deleteEntry(path: string): Promise<void> {
    const lastSlash = path.lastIndexOf("/");
    const parent = path.slice(0, lastSlash) || "/";
    const name = path.slice(lastSlash + 1);
    ensurePath(parent);
    fsData.fs[parent] = fsData.fs[parent].filter((n) => n !== name);
    delete fsData.fs[path];
    saveFs(fsData.fs);
  }
};
