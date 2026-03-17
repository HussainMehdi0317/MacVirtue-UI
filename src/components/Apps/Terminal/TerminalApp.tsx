import React from "react";

interface Line {
  id: string;
  text: string;
}

const helpText = [
  "help        - show this help",
  "about       - about this terminal",
  "clear       - clear screen",
  "list-actions - show allowed native actions (mock)"
];

const TerminalApp: React.FC = () => {
  const [lines, setLines] = React.useState<Line[]>([
    {
      id: "intro",
      text:
        "MacVirtue Terminal (sandboxed). Native shell is disabled by default."
    },
    { id: "hint", text: "Type 'help' to see available commands." }
  ]);
  const [input, setInput] = React.useState("");
  const endRef = React.useRef<HTMLDivElement | null>(null);

  const pushLine = (text: string) =>
    setLines((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random()}`, text }
    ]);

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;
    pushLine(`> ${trimmed}`);

    switch (trimmed) {
      case "help":
        helpText.forEach((t) => pushLine(t));
        break;
      case "about":
        pushLine(
          "This is a sandboxed terminal. To enable an elevated shell, see Settings → Permissions and follow docs."
        );
        break;
      case "clear":
        setLines([]);
        break;
      case "list-actions":
        pushLine("Allowed actions (when enabled): make_folder, open_file, open_url, close_app, sleep_system, set_wallpaper, network_details.");
        break;
      default:
        pushLine(`Unknown command '${trimmed}'. Type 'help'.`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input;
    setInput("");
    handleCommand(cmd);
  };

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  return (
    <div className="h-full flex flex-col bg-black/70 text-[11px] text-slate-100 font-mono">
      <div className="flex-1 overflow-auto px-3 py-2">
        {lines.map((line) => (
          <div key={line.id}>{line.text}</div>
        ))}
        <div ref={endRef} />
      </div>
      <form onSubmit={handleSubmit} className="border-t border-white/10 px-3 py-1">
        <div className="flex items-center space-x-1">
          <span className="text-emerald-400">user@macvirtue</span>
          <span className="text-slate-500">~$</span>
          <input
            className="flex-1 bg-transparent outline-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoFocus
          />
        </div>
      </form>
    </div>
  );
};

export default TerminalApp;
