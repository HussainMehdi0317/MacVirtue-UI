import React from "react";
import { useSystemStore } from "../../../state/useSystemStore";

interface Line {
  id: string;
  text: string;
  isError?: boolean;
}

const helpText = [
  "help               - show this help",
  "about              - about this terminal",
  "clear              - clear screen",
  "whoami             - show current user",
  "date               - show current date/time",
  "permissions        - show your permission settings",
  "list-actions       - show available native actions",
  "echo <text>        - echo text to screen",
  "pwd                - show current directory (mock)",
  "ls                 - list files in current directory (mock)",
  "mkdir <name>       - create folder (if permission granted)",
  "cat <file>         - read file (if permission granted)"
];

const TerminalApp: React.FC = () => {
  const [lines, setLines] = React.useState<Line[]>([
    {
      id: "intro",
      text: "MacVirtue Terminal (sandboxed). Type 'help' for commands."
    }
  ]);
  const [input, setInput] = React.useState("");
  const [currentDir, setCurrentDir] = React.useState("/home/user");
  const endRef = React.useRef<HTMLDivElement | null>(null);

  // Get permissions from store
  const permissions = useSystemStore((s) => s.permissions);
  const canMakeFolder = permissions.find((p) => p.action === "make_folder")?.decision !== "deny";
  const canOpenFile = permissions.find((p) => p.action === "open_file")?.decision !== "deny";
  const canNetworkDetails = permissions.find((p) => p.action === "network_details")?.decision !== "deny";

  const pushLine = (text: string, isError = false) =>
    setLines((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random()}`, text, isError }
    ]);

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;
    pushLine(`$ ${trimmed}`);

    const parts = trimmed.split(" ");
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (command) {
      case "help":
        helpText.forEach((t) => pushLine(t));
        break;

      case "about":
        pushLine("MacVirtue Terminal v1.0");
        pushLine("Sandboxed environment for safe command execution");
        pushLine("See Settings → Permissions to grant capabilities");
        break;

      case "clear":
        setLines([]);
        break;

      case "whoami":
        pushLine("user@macvirtue");
        break;

      case "date":
        pushLine(new Date().toString());
        break;

      case "pwd":
        pushLine(currentDir);
        break;

      case "ls":
        if (currentDir === "/home/user") {
          pushLine("Desktop/");
          pushLine("Documents/");
          pushLine("Downloads/");
          pushLine("Pictures/");
        } else {
          pushLine("(empty directory)");
        }
        break;

      case "echo":
        if (args.length === 0) {
          pushLine("");
        } else {
          pushLine(args.join(" "));
        }
        break;

      case "cd":
        if (args.length === 0) {
          setCurrentDir("/home/user");
          pushLine("Changed to home directory");
        } else if (args[0] === "..") {
          setCurrentDir("/home/user");
          pushLine("Changed directory");
        } else if (args[0].startsWith("/")) {
          setCurrentDir(args[0]);
          pushLine(`Changed to ${args[0]}`);
        } else {
          pushLine(`${currentDir}/${args[0]}`);
          setCurrentDir(`${currentDir}/${args[0]}`);
        }
        break;

      case "mkdir":
        if (args.length === 0) {
          pushLine("mkdir: missing directory name", true);
        } else if (!canMakeFolder) {
          pushLine("Permission denied: Create folders capability not granted", true);
          pushLine("Enable it in Settings → Permissions");
        } else {
          pushLine(`Created directory: ${args[0]}`);
        }
        break;

      case "cat":
        if (args.length === 0) {
          pushLine("cat: missing file name", true);
        } else if (!canOpenFile) {
          pushLine("Permission denied: Open files capability not granted", true);
          pushLine("Enable it in Settings → Permissions");
        } else {
          pushLine(`[File contents: ${args[0]}]`);
          pushLine("(mock file - permissions system working!)");
        }
        break;

      case "permissions":
        if (permissions.length === 0) {
          pushLine("All permissions: DENIED (default)");
        } else {
          pushLine("Current permissions:");
          permissions.forEach((p) => {
            const action = p.action.padEnd(20);
            pushLine(`  ${action} ${p.decision}`);
          });
        }
        break;

      case "list-actions":
        pushLine("Available native actions:");
        pushLine("  • make_folder              (status: " + (canMakeFolder ? "ALLOWED" : "DENIED") + ")");
        pushLine("  • open_file                (status: " + (canOpenFile ? "ALLOWED" : "DENIED") + ")");
        pushLine("  • open_url                 (status: DENIED)");
        pushLine("  • close_app                (status: DENIED)");
        pushLine("  • sleep_system             (status: DENIED)");
        pushLine("  • set_wallpaper            (status: DENIED)");
        pushLine("  • network_details          (status: " + (canNetworkDetails ? "ALLOWED" : "DENIED") + ")");
        break;

      case "network":
        if (!canNetworkDetails) {
          pushLine("Permission denied: Network details capability not granted", true);
        } else {
          pushLine("Network Status: Connected");
          pushLine("SSID: MacVirtue-Network");
          pushLine("Signal Strength: -45 dBm (Excellent)");
          pushLine("IP Address: 192.168.1.100");
        }
        break;

      case "":
        // Empty command
        break;

      default:
        pushLine(`Command not found: '${command}'. Type 'help' for available commands.`, true);
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
    <div className="h-full flex flex-col bg-black text-[11px] text-slate-100 font-mono">
      <div className="flex-1 overflow-auto px-3 py-2">
        {lines.map((line) => (
          <div key={line.id} className={line.isError ? "text-red-400" : ""}>
            {line.text}
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <form onSubmit={handleSubmit} className="border-t border-white/10 px-3 py-1 bg-black/50">
        <div className="flex items-center space-x-1">
          <span className="text-cyan-400">user@macvirtue</span>
          <span className="text-slate-500">:{currentDir}$</span>
          <input
            className="flex-1 bg-transparent outline-none text-green-400"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoFocus
            spellCheck="false"
          />
        </div>
      </form>
    </div>
  );
};

export default TerminalApp;
