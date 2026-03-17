import React from "react";
import { mockFsApi } from "../../../tauri-bridge/mockBridge";

const FinderApp: React.FC = () => {
  const [path] = React.useState<string>("/sandbox");
  const [items, setItems] = React.useState<string[]>([]);
  const [newFolderName, setNewFolderName] = React.useState("");

  const load = React.useCallback(async () => {
    const dir = await mockFsApi.listDirectory(path);
    setItems(dir);
  }, [path]);

  React.useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async () => {
    if (!newFolderName.trim()) return;
    await mockFsApi.makeFolder(`${path}/${newFolderName.trim()}`);
    setNewFolderName("");
    load();
  };

  const handleDelete = async (name: string) => {
    await mockFsApi.deleteEntry(`${path}/${name}`);
    load();
  };

  return (
    <div className="h-full flex flex-col text-xs text-slate-100">
      <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="font-semibold">Sandbox Files</span>
          <span className="text-slate-400">{path}</span>
        </div>
        <div className="flex items-center space-x-2">
          <input
            className="bg-black/40 border border-white/10 rounded px-2 py-1 text-[11px] outline-none"
            placeholder="New folder name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
          <button
            className="text-[11px] px-2 py-1 rounded bg-emerald-500/90 hover:bg-emerald-400 text-black"
            onClick={handleCreate}
          >
            Create
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto px-3 py-2">
        {items.length === 0 ? (
          <div className="text-slate-400 text-[11px]">
            No items yet. Create a new folder to get started.
          </div>
        ) : (
          <ul className="space-y-1">
            {items.map((name) => (
              <li
                key={name}
                className="flex items-center justify-between rounded px-2 py-1 hover:bg-white/5"
              >
                <span>{name}</span>
                <button
                  className="text-[11px] text-rose-300 hover:text-rose-200"
                  onClick={() => handleDelete(name)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FinderApp;
