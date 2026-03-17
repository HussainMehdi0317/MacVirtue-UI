import React from "react";

const STORAGE_KEY = "macvirtue-notes";

const NotesApp: React.FC = () => {
  const [value, setValue] = React.useState("");

  React.useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved != null) setValue(saved);
  }, []);

  React.useEffect(() => {
    const id = setTimeout(
      () => window.localStorage.setItem(STORAGE_KEY, value),
      400
    );
    return () => clearTimeout(id);
  }, [value]);

  return (
    <textarea
      className="w-full h-full bg-transparent text-xs text-slate-100 px-3 py-2 outline-none resize-none leading-relaxed"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Type your notes here… (autosaved locally)"
    />
  );
};

export default NotesApp;
